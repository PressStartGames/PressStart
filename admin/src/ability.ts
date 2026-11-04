// The same mapping the Worker uses (server/src/ability.ts): "signups:read" -> can('read', 'Signup').
// Here it only hides what a role cannot use; the Worker refuses it regardless.
import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

const SUBJECTS = { signups: 'Signup', broadcasts: 'Broadcast', users: 'User' } as const;
type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS] | 'all';
type Action = 'read' | 'export' | 'delete' | 'send' | 'manage';
export type AppAbility = MongoAbility<[Action, Subject]>;

export function abilityFor(permissions: readonly string[] = []): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  for (const p of permissions) {
    const [resource, action] = p.split(':');
    const subject = SUBJECTS[resource as keyof typeof SUBJECTS];
    if (subject && action) can(action as Action, subject);
  }
  return build();
}

export { AbilityProvider, Can } from '@casl/react';
