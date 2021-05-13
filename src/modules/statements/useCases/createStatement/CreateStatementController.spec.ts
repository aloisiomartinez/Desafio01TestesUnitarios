import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        values('${id}', 'user name', 'user@email.com', '${password}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to perform a deposit", async () => {
    // Arrange
    const userData = {
      name: "user name",
      email: "user@email.com",
      password: "123456"
    };

    let response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

    const { token } = response.body;

    // Act
    response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 5,
        description: "Deposit"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    // Assert
    expect(response.status).toBe(201);
  })

  it("should be able to perform a withdraw", async () => {
    // Arrange
    const userData = {
      name: "user name",
      email: "user@email.com",
      password: "123456"
    };

    let response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

    const { token } = response.body;

    response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);

    // Act
    response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const withdraw = response.body;

    // Assert
    expect(response.status).toBe(201);
    expect(withdraw.type).toBe("withdraw");
    expect(withdraw.amount).toBe(50);
  })
})
