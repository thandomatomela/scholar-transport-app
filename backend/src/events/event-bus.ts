import type {
  DomainEvent,
  DomainEventHandler,
} from "./domain-event.js";

const handlers = new Map<
  DomainEvent["type"],
  DomainEventHandler[]
>();

export function subscribeToDomainEvent(
  eventType: DomainEvent["type"],
  handler: DomainEventHandler,
) {
  const existingHandlers = handlers.get(eventType) ?? [];

  existingHandlers.push(handler);
  handlers.set(eventType, existingHandlers);
}

export async function publishDomainEvent(
  event: DomainEvent,
) {
  const eventHandlers = handlers.get(event.type) ?? [];

  const results = await Promise.allSettled(
    eventHandlers.map((handler) => handler(event)),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Domain event handler failed:", {
        event,
        error: result.reason,
      });
    }
  }
}