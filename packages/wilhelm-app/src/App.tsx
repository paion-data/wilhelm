/**
 * Copyright 2025 Paion Data. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useState } from "react";
import "./App.css";

import Navigation from "./components/navigation/Navigation";
import TopBar from "./components/TopBar";
import { selectHoveredLanguage, selectNavigationExpanded, useAppSelector } from "../../wilhelm-redux/";
import FlashCard from "./components/flashcard";
import { expand, getCountByLanguage, getVocabulariesByLanguage } from "./components/Webservice";
import GraphBrowser from "./components/graph";

export default function App(): JSX.Element {
  const navigationExpanded = useAppSelector(selectNavigationExpanded);

  const [vocabulary, setVocabulary] = useState<{ term: string; definition: string }>();
  const [vocabularyCount, setVocabularyCount] = useState<number>(0);
  const [displayedIndex, setDisplayedIndex] = useState<number>(1);
  const [displayedGraph, setDisplayedGraph] = useState({
    nodes: [],
    links: [],
  });

  const language = useAppSelector(selectHoveredLanguage);

  useEffect(() => {
    void getCountByLanguage(language).then((count) => {
      setVocabularyCount(count);
    });
  }, [language]);

  useEffect(() => {
    void getVocabulariesByLanguage(language, displayedIndex).then((vocabulary) => {
      setVocabulary({ term: vocabulary.term, definition: vocabulary.definition });
    });
  }, [language, displayedIndex]);

  useEffect(() => {
    if (vocabulary == null) {
      return;
    }

    void expand(vocabulary.term).then((graph) => {
      setDisplayedGraph({
        nodes: (graph.get("nodes") as any[]).map((node) => {
          return {
            id: node.id,
            elementId: node.id,
            labels: node.attributes.language ? ["Term"] : ["Definition"],
            properties: {
              name: node.label,
            },
            propertyTypes: {
              name: "string",
            },
          };
        }) as [],
        links: (graph.get("links") as any[]).map((link) => {
          return {
            id: link.sourceNodeId + link.targetNodeId,
            elementId: link.sourceNodeId + link.targetNodeId,
            startNodeId: link.sourceNodeId,
            endNodeId: link.targetNodeId,
            type: link.label,
            properties: {},
            propertyTypes: {},
          };
        }) as [],
      });
    });
  }, [vocabulary]);

  return (
    <>
      <div className="container">
        <div className="navigationSection">
          <Navigation />
        </div>
        <div className={navigationExpanded ? "mainSection" : "mainSection active"}>
          <TopBar />

          <div className="flashcards">
            {displayedIndex > 1 && (
              <div
                className="vocArrow prev"
                onClick={() => {
                  setDisplayedIndex(displayedIndex - 1);
                }}
              >
                <div></div>
              </div>
            )}
            {vocabulary != null && (
              <FlashCard language={language} term={vocabulary.term} definition={vocabulary.definition} />
            )}
            {displayedIndex < vocabularyCount && (
              <div
                className="vocArrow next"
                onClick={() => {
                  setDisplayedIndex(displayedIndex + 1);
                }}
              >
                <div></div>
              </div>
            )}
          </div>

          <div className="graphBrowser">
            {displayedGraph.nodes.length > 0 && (
              <GraphBrowser nodes={displayedGraph.nodes} links={displayedGraph.links} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
