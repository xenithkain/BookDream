import { Client, Databases, Account } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66d8d3da001d5a4c82bb");
export const databaseKey = "66d8d504002297d3436f";
export const account = new Account(client);

export const databases = new Databases(client, databaseKey);

export const usersCollection = "66d8d5a90031df9dac29";
