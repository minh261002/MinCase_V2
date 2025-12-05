import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";
import DesignConfiguration from "./design-configuration";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const DesignPage = async ({ searchParams }: PageProps) => {
  const { id } = await searchParams;
  if (!id || typeof id !== "string") return notFound();

  const configuration = await db.configuration.findUnique({
    where: { id },
  });

  if (!configuration) return notFound();

  const { imageUrl, width, height } = configuration;

  return (
    <DesignConfiguration
      configId={configuration.id}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    />
  );
};

export default DesignPage;
