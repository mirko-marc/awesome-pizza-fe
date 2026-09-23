import { mapOrder } from '@shared/mapper/order.mapper';
import { mapPizza } from './customer.mapper';

describe('customer mappers', () => {
  it('maps a pizza DTO to a frontend model', () => {
    expect(mapPizza({ id: 7, name: 'Margherita', description: 'Classic', price: 9.5 })).toEqual({
      id: 7,
      name: 'Margherita',
      description: 'Classic',
      price: 9.5,
    });
  });

  it('maps nullable timestamps and numeric order values', () => {
    const order = mapOrder({
      orderCode: '10000000-0000-0000-0000-000000000001',
      status: 'RECEIVED',
      items: [
        {
          pizzaId: 1,
          pizzaName: 'Margherita',
          quantity: 2,
          unitPrice: 9.5,
          lineTotal: 19,
        },
      ],
      total: 19,
      createdAt: '2026-09-23T12:00:00Z',
      updatedAt: '2026-09-23T12:00:00Z',
      preparationStarted: null,
      completedAt: null,
    });

    expect(order.total).toBe(19);
    expect(order.id).toBeNull();
    expect(order.createdAt).toEqual(new Date('2026-09-23T12:00:00Z'));
    expect(order.preparationStarted).toBeNull();
  });
});
