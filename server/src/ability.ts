// Permissions arrive in the WorkOS access token as strings like "signups:read". CASL turns them into
// an ability; every admin route asks it. The admin app builds the same ability from the same list
// (with @casl/react) only to hide what a role cannot use — the Worker is the real gate.
import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

export const SUBJECTS = {
  signups: 'Signup',
  broadcasts: 'Broadcast',
  users: 'User',
} as const;

export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS] | 'all';
export type Action = 'read' | 'export' | 'delete' | 'send' | 'manage';
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
