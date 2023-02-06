import app, { init } from "@/app";
import { disconnectDB } from "@/config";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus = require("http-status");
import { createEnrollmentWithAddress, createUser, createTicketTypeRemote, createTicket, createPayment, createTicketTypeInPerson, createHotel, createTicketTypeInPersonWithoutHotel } from "../factories";
import faker from "@faker-js/faker";
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

afterAll(async () => {
    await disconnectDB();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userCreated = await createUser();
        const token = jwt.sign({
            userId: userCreated.id 
        }, process.env.JWT_SECRET);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when there are no hotels', async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when user has no enrollment', async () => {
            const userCreated =  await createUser();
            const token = await generateValidToken(userCreated);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
        
        it('should respond with status 404 when user has no tickets', async () => {
            const userCreated =  await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with status 402 when ticket has not been paid', async () => {
            const userCreated = await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);
            const ticketType = await createTicketTypeRemote();
            const ticketCreated = await createTicket(enrollmentCreated.id, ticketType.id, TicketStatus.RESERVED);
            const paymentCreated = await createPayment(ticketCreated.id, ticketType.price);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 402 when user ticket is remote', async () => {
            const userCreated = await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);
            const ticketType = await createTicketTypeRemote();
            const ticketCreated = await createTicket(enrollmentCreated.id, ticketType.id, TicketStatus.PAID);
            const paymentCreated = await createPayment(ticketCreated.id, ticketType.price);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 402 when hotel is not included', async () => {
            const userCreated = await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);
            const ticketType = await createTicketTypeInPersonWithoutHotel();
            const ticketCreated = await createTicket(enrollmentCreated.id, ticketType.id, TicketStatus.PAID);
            const paymentCreated = await createPayment(ticketCreated.id, ticketType.price);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 200 and an empty array', async () => {
            const userCreated = await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);
            const ticketType = await createTicketTypeInPerson();
            const ticketCreated = await createTicket(enrollmentCreated.id, ticketType.id, TicketStatus.PAID);
            const paymentCreated = await createPayment(ticketCreated.id, ticketType.price);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual([]);
        });

        it('should respond with status 200 and a hotels array', async () => {
            const userCreated = await createUser();
            const token = await generateValidToken(userCreated);
            const enrollmentCreated = await createEnrollmentWithAddress(userCreated);
            const ticketType = await createTicketTypeInPerson();
            const ticketCreated = await createTicket(enrollmentCreated.id, ticketType.id, TicketStatus.PAID);
            const paymentCreated = await createPayment(ticketCreated.id, ticketType.price);
            const hotelCreated = await createHotel();

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual([
                {
                    id: hotelCreated.id,
                    name: hotelCreated.name,
                    image: hotelCreated.image,
                    createdAt: hotelCreated.createdAt.toISOString(),
                    updatedAt: hotelCreated.updatedAt.toISOString()
                },
            ]);            
        });
    })
})