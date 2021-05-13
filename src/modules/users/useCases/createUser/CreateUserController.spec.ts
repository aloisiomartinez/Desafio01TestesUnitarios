import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    // Arrange
    const user = {
      name: "user name",
      email: "user@email.com",
      password: "123456"
    };

    // Act
    const response = await request(app)
      .post("/api/v1/users")
      .send(user);

    // Assert
    expect(response.status).toBe(201);
  })
})
