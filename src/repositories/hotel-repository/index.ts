import { prisma } from "@/config";

async function findMany() {
    return prisma.hotel.findMany();
}

const hotelRepository = {
    findMany,
};

export default hotelRepository;