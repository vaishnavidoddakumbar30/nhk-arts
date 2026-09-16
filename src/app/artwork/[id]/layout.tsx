import type { Metadata, ResolvingMetadata } from "next";
import { supabase } from "@/lib/supabase";

type Props = {
  params: { id: string }
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  let title = "Artwork | N H K ARTS";
  let description = "View this exclusive piece in the N H K ARTS collection.";
  
  try {
    const { data, error } = await supabase.from('artworks').select('title, description').eq('id', id).single();
    if (!error && data) {
      title = `${data.title} | N H K ARTS`;
      description = data.description || description;
    }
  } catch (error) {
    console.error("Error fetching metadata for artwork:", error);
  }

  return {
    title,
    description,
  };
}

export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
