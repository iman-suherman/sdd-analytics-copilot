import { GoogleGenAI } from "@google/genai";
import {
  applyProjectAdc,
  resolveGcpProjectId,
  resolveVertexLocation,
  resolveVertexModel,
} from "../gcp/credentials";

let client: GoogleGenAI | null | undefined;

export function getVertexClient(): GoogleGenAI | null {
  if (client !== undefined) return client;

  applyProjectAdc();
  const project = resolveGcpProjectId();
  if (!project) {
    client = null;
    return client;
  }

  try {
    client = new GoogleGenAI({
      vertexai: true,
      project,
      location: resolveVertexLocation(),
    });
  } catch (error) {
    console.error("vertex: failed to init client", error);
    client = null;
  }
  return client;
}

export function getVertexModelId(): string {
  return resolveVertexModel();
}

/** Reset cached client (tests). */
export function resetVertexClient(): void {
  client = undefined;
}
