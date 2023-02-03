import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    try {
        const hotels = await hotelsService.getHotels();
        return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
        return res.status(httpStatus.NO_CONTENT);
    }
}