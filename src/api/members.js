import { api } from './client';

export async function inviteMembers(listId, emails, role = 'member') {
  return api('/members/invite', {
    method: 'POST',
    body: { listId, emails, role }
  });
}

