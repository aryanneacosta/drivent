import { ApplicationError } from "@/protocols";

export function cannotGetHotelsError(): ApplicationError {
    return {
        name: 'cannotGetHotelsError',
        message: 'Cannot get hotels list!'
    };
}