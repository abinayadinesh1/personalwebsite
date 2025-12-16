export async function load({ params, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  const projectId = params.id;
  
  return {
    projectId,
    isAdmin
  };
}
