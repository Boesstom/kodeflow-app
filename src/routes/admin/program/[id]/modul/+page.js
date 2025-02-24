export const ssr = false;

export function load({ params }) {
  return {
    programId: params.id
  };
}
