import { BunyanLogger } from "logger";
import {
  Client,
  PlaceAutocompleteResponse,
} from "@googlemaps/google-maps-services-js";
import { IGeolocation } from "./IGeolocation";
import { LocationAutocomplete, LocationDetails } from "api-client";

export class GoogleGeolocation implements IGeolocation {
  private logger: BunyanLogger;
  private key: string | undefined;
  private client: Client;

  constructor(logger: BunyanLogger) {
    this.logger = logger;
    this.key = process.env.GOOGLE_MAPS_API_KEY;
    this.client = new Client({});
  }

  // async forward (address: string | undefined): Promise<{ lat: string, long: string, address: string } | null> {
  //     if (this.key === undefined) throw new Error('API key is not set')
  //     if (address === undefined) return null
  //     const autoAddress = await this.autocomplete(address)
  //     if (autoAddress === undefined) return null
  //     const { data }: GeocodeResponse = await this.client.geocode({
  //         params: {
  //             key: this.key,
  //             address: autoAddress
  //         }
  //     })
  //     if (data.results.length <= 0) return null
  //     const results = data.results[0].geometry.location
  //     return {
  //         lat: `${results.lat}`,
  //         long: `${results.lng}`,
  //         address: data.results[0].formatted_address
  //     }
  // }

  async autocomplete(
    address: string,
    session: string,
  ): Promise<LocationAutocomplete[]> {
    if (this.key === undefined) throw new Error("API key is not set");
    this.logger.info("lib autocomplete", { address, session });
    const { data }: PlaceAutocompleteResponse =
      await this.client.placeAutocomplete({
        params: {
          input: address,
          key: this.key,
          sessiontoken: session,
        },
      });
    return data.predictions.map((prediction) => {
      return {
        placeId: prediction.place_id,
        description: prediction.description,
      };
    });
  }

  async getDetails(placeId: string): Promise<LocationDetails> {
    if (this.key === undefined) throw new Error("API key is not set");
    // Call the placeDetails function with the place ID
    const response = await this.client.placeDetails({
      params: {
        place_id: placeId,
        key: this.key,
      },
      timeout: 1000,
    });

    // Extract the relevant information from the response
    const result = response.data.result;
    const address = result.formatted_address;
    const latitude = result.geometry?.location.lat;
    const longitude = result.geometry?.location.lng;
    const name = result.name;
    const url = result.url;

    // Return the place details
    return {
      address,
      latitude,
      longitude,
      name,
      url,
      placeId,
    };
  }
}
