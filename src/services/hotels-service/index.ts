import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels() {
    const hotels = await hotelRepository.findMany();
    if (!hotels) throw notFoundError();

    return hotels;
}

const hotelsService = {
    getHotels,
}

export default hotelsService;