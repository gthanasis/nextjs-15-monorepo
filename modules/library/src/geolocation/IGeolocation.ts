import { LocationAutocomplete, LocationDetails } from "api-client";

export interface IGeolocation {
  autocomplete(
    address: string,
    session: string,
  ): Promise<LocationAutocomplete[]>;
  getDetails(placeId: string): Promise<LocationDetails>;
}
