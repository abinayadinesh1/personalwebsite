export async function load({ cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  
  return {
    isAdmin
  };
}
