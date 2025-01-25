import { BunyanLogger } from "logger";
import { IGeolocation } from "./IGeolocation";
import { LocationAutocomplete, LocationDetails } from "api-client";

export class MockGeolocation implements IGeolocation {
  private logger: BunyanLogger;

  constructor(logger: BunyanLogger) {
    this.logger = logger;
  }

  async forward(
    address: string | undefined,
  ): Promise<{ lat: string; long: string; address: string } | null> {
    return Promise.resolve({
      lat: "1",
      long: "2",
      address: "address",
    });
  }

  async autocomplete(address: string): Promise<LocationAutocomplete[]> {
    return Promise.resolve([]);
  }

  async getDetails(placeId: string): Promise<LocationDetails> {
    return {
      address: "",
      latitude: 0,
      longitude: 0,
      name: "",
      placeId: "",
    };
  }
}
