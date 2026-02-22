import { supabase } from './supabase.js'

export async function addContact(contact) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)

  if (error) alert(error.message)
  return data
}

export async function getContacts() {
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return data
}