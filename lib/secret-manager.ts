import axios from "axios";
import type { AxiosInstance } from "axios";
import * as https from "https";

type SecretManagerModuleOptions = {
  url: string;
  secretKey: string;
};

export class SecretManagerService {
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly options: SecretManagerModuleOptions) {
    this.axiosInstance = axios.create({
      baseURL: this.options.url,
      headers: {
        "X-Vault-Token": this.options.secretKey,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  private async request(
    method: "post" | "get" | "put" | "delete",
    path: string,
    data?: any
  ) {
    const response = await this.axiosInstance.request({
      method,
      url: `/v1/kv/data/${path}`,
      data,
    });

    return response.data;
  }

  async create(path: string, data: Record<string, any>) {
    if (!path) throw new Error("Path cannot be empty");

    try {
      await this.request("post", path, { data });
      return { success: true };
    } catch (error: any) {
      console.error("Error creating secret:", error.message);
      throw error;
    }
  }

  async findOne(path: string) {
    if (!path) throw new Error("Path cannot be empty");

    try {
      const response = await this.request("get", path);
      return { success: true, data: response };
    } catch (error: any) {
      console.error("Error fetching secret:", error.message);
      throw error;
    }
  }

  async update(path: string, data: Record<string, any>) {
    if (!path) throw new Error("Path cannot be empty");

    try {
      await this.request("get", path); // Confirm it exists
      await this.request("put", path, { data });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating secret:", error.message);
      throw error;
    }
  }

  async delete(path: string) {
    if (!path) throw new Error("Path cannot be empty");

    try {
      const response = await this.request("get", path);
      await this.request("delete", path);
      return { success: true, data: response };
    } catch (error: any) {
      console.error("Error deleting secret:", error.message);
      throw error;
    }
  }
}
