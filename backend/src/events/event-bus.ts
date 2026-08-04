import type {
  DomainEvent,
  DomainEventHandler,
} from "./domain-event.js";

type DomainEventType =
  DomainEvent["type"];

type EventForType<
  TEventType extends DomainEventType,
> = Extract<
  DomainEvent,
  {
    type: TEventType;
  }
>;

const handlers = new Map<
  DomainEventType,
  DomainEventHandler[]
>();

export function subscribeToDomainEvent<
  TEventType extends DomainEventType,
>(
  eventType: TEventType,
  handler: DomainEventHandler<
    EventForType<TEventType>
  >,
): void {
  const existingHandlers =
    handlers.get(eventType) ?? [];

  existingHandlers.push(
    handler as DomainEventHandler,
  );

  handlers.set(
    eventType,
    existingHandlers,
  );
}

export async function publishDomainEvent(
  event: DomainEvent,
): Promise<void> {
  const eventHandlers =
    handlers.get(event.type) ?? [];

  const results =
    await Promise.allSettled(
      eventHandlers.map(
        async (handler) => {
          await handler(event);
        },
      ),
    );

  for (const result of results) {
    if (
      result.status === "rejected"
    ) {
      console.error(
        "Domain event handler failed:",
        {
          event,
          error: result.reason,
        },
      );
    }
  }
}