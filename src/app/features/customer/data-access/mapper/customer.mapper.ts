import { Pizza } from '../../models/pizza.model';
import { PizzaResponseDto } from '../dto/customer-api.dto';

export function mapPizza(dto: PizzaResponseDto): Pizza {
  return {
    id: required(dto.id, 'pizza.id'),
    name: required(dto.name, 'pizza.name'),
    description: dto.description ?? '',
    price: Number(required(dto.price, 'pizza.price')),
  };
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined) throw new Error(`Missing API field: ${field}`);
  return value;
}
