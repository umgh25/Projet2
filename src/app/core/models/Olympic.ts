// This file defines the Olympic interface, which represents the Olympic Games details for a specific country.
import { Participation } from './Participation';


export interface Olylmpic {
    id: number;
    country: string;
    participations: Participation[];
}

