export async function load({ cookies }) {
  return {
    isAdmin: cookies.get('adminAuth') === 'true'
  };
}
