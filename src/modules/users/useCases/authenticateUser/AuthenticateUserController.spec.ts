import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    // Arrange
    const user = {
      name: "user name",
      email: "user@email.com",
      password: "123456"
    };

    await request(app)
      .post("/api/v1/users")
      .send(user);

    // Act
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    // Assert
    const { user: userInfo, token } = response.body;

    expect(response.status).toBe(200);
    expect(token).not.toBeNull();
    expect(userInfo).toHaveProperty("id");
  })
})
