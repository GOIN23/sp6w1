import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(public readonly userId: string) { }
}



import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  handle(event: UserCreatedEvent) {
    console.log(`User created with ID: ${event.userId}`);
    // Ваша логика обработки события здесь
  }
}
