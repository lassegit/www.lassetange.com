import type { PageProps } from '@rshono/core';
import { Layout } from './layout';

export default function Home({ url }: PageProps<'/'>) {
  return (
    <Layout>
      <h1>Home</h1>
      <title>Home</title>
    </Layout>
  );
}
