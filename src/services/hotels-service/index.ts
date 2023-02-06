import { notFoundError } from "@/errors";
import { cannotGetHotelsError } from "@/errors/cannot-get-hotels-error";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket =  await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
        throw cannotGetHotelsError();
    }

    const hotels = await hotelRepository.findMany();
    if (!hotels) throw notFoundError();

    return hotels;
}

const hotelsService = {
    getHotels,
}

export default hotelsService;