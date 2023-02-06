import { notFoundError } from "@/errors";
import { cannotGetHotelsError } from "@/errors/cannot-get-hotels-error";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function validateGetHotels(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket =  await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket) throw notFoundError();

    if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
        throw cannotGetHotelsError();
    }
}

async function getHotels(userId: number) {
    await validateGetHotels(userId);

    const hotels = await hotelRepository.findMany();
    if (!hotels) throw notFoundError();

    return hotels;
}

async function getHotelsRooms(userId: number, hotelId: number) {    
    await validateGetHotels(userId);

    const hotelsRooms = await hotelRepository.findRooms(hotelId);
    if (!hotelsRooms) throw notFoundError();

    return hotelsRooms;
}

const hotelsService = {
    getHotels,
    getHotelsRooms
}

export default hotelsService;