import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    
    try {
        const hotels = await hotelsService.getHotels(Number(userId));
        return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
        if (error.name === 'cannotGetHotelsError') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        return res.sendStatus(httpStatus.NOT_FOUND)
    }
}

export async function getHotelsRooms(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { hotelId } = req.params;

    try {
        const rooms = await hotelsService.getHotelsRooms(Number(userId), Number(hotelId));
        return res.status(httpStatus.OK).send(rooms);
    } catch (error) {
        if (error.name === 'cannotGetHotelsError') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        return res.sendStatus(httpStatus.NOT_FOUND)
    }
}