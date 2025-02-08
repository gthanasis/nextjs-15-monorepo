import { AxiosInstance } from "axios";
import { IUser, IUserPublicProfile, CreateUserDto } from "./types/users";
import { ApiResponse } from "./types/generic";

export class UsersClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getMe(): Promise<ApiResponse<IUserPublicProfile>> {
    console.log("getMe");
    const res =
      await this.client.get<ApiResponse<IUserPublicProfile>>("/users/me");
    return res.data;
  }

  async getById(userId: string): Promise<ApiResponse<IUserPublicProfile>> {
    const res = await this.client.get<ApiResponse<IUserPublicProfile>>(
      `/users/${userId}`,
    );
    return res.data;
  }

  async update(
    userId: string,
    data: Partial<IUser>,
  ): Promise<ApiResponse<IUserPublicProfile>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile>>(
      `/users/${userId}`,
      data,
    );
    return res.data;
  }

  async delete(userId: string): Promise<ApiResponse<{ user: number }>> {
    const res = await this.client.delete<ApiResponse<{ user: number }>>(
      `/users/${userId}`,
    );
    return res.data;
  }

  async createFromGoogle(
    user: Partial<CreateUserDto> & { id: string },
  ): Promise<ApiResponse<IUserPublicProfile>> {
    const res = await this.client.post<ApiResponse<IUserPublicProfile>>(
      "/users/google",
      { user },
    );
    return res.data;
  }

  // Admin methods
  async create(user: Partial<IUser>): Promise<ApiResponse<IUserPublicProfile>> {
    const res = await this.client.post<ApiResponse<IUserPublicProfile>>(
      "/users",
      user,
    );
    return res.data;
  }

  async enable(userId: string): Promise<ApiResponse<IUserPublicProfile[]>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile[]>>(
      `/users/${userId}/enable`,
    );
    return res.data;
  }

  async disable(userId: string): Promise<ApiResponse<IUserPublicProfile[]>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile[]>>(
      `/users/${userId}/disable`,
    );
    return res.data;
  }

  async promote(
    userId: string,
    role: string,
  ): Promise<ApiResponse<IUserPublicProfile[]>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile[]>>(
      `/users/${userId}/promote/${role}`,
    );
    return res.data;
  }

  async updateLocation(
    userId: string,
    location: { lat: string; long: string },
  ): Promise<ApiResponse<IUserPublicProfile[]>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile[]>>(
      `/users/${userId}/location`,
      location,
    );
    return res.data;
  }

  async updateLastSeenOn(
    userId: string,
    location: { lat: string; long: string },
  ): Promise<ApiResponse<IUserPublicProfile[]>> {
    const res = await this.client.patch<ApiResponse<IUserPublicProfile[]>>(
      `/users/${userId}/lastSeenOn`,
      location,
    );
    return res.data;
  }

  async getAll(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    order?: string;
    orderDirection?: "asc" | "desc";
    [key: string]: any;
  }): Promise<
    ApiResponse<{
      users: IUserPublicProfile[];
      count: number;
      pagination: { page: number; pageSize: number; filtered: number };
      order: { order: string | null; direction: string | null };
    }>
  > {
    const res = await this.client.get("/users", { params });
    return res.data;
  }
}
