import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
    return await prisma.hotel.create({
        data: {
            name: faker.name.findName(),
            image: faker.image.imageUrl()
        }
    });
}

export async function createRoom(hotelId: number) {
    return await prisma.room.create({
        data: {
            name: faker.address.buildingNumber(),
            capacity:faker.datatype.number({ max: 6}),
            hotelId: hotelId
        }
    });
}