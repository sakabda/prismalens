import { useState, useCallback } from "react";

import {
  ArrowRight,
  Sparkles,
  Trash2,
  BookmarkPlus,
  AlignLeft,
  ListChecks,
  TreePine,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  motion,
  AnimatePresence,
} from "framer-motion";


import CodeEditor from "../components/CodeEditor";
import CopyButton from "../components/CopyButton";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";


import AnalysisPanel from "../components/converter/AnalysisPanel";
import SuggestionPanel from "../components/converter/SuggestionPanel";
import ASTViewer from "../components/converter/ASTViewer";
import ExampleSidebar from "../components/converter/ExampleSidebar";


import {
  prismaToSql,
} from "../services/converter/prisma-to-sql";


import {
  sqlToPrisma,
} from "../services/converter/sql-to-prisma";


import {
  parsePrismaQuery,
} from "../services/converter/parser";


import {
  analyzeQuery,
} from "../services/analyzer";


import {
  getSuggestions,
} from "../services/analyzer/suggestions";


import {
  saveHistory,
} from "../services/history";


import {
  saveSnippet,
} from "../services/snippets";


import {
  useKeyboardShortcuts,
} from "../hooks/useKeyboardShortcuts";


import {
  cn,
} from "../utils/cn";


import type {
  ConverterMode,
  BottomTab,
  QueryAnalysis,
} from "../types";


import type {
  QueryNode,
} from "../services/converter/ast/prisma";


import CreateSnippetModal from "../components/snippets/CreateSnippetModal";



const DEFAULT_PRISMA = `prisma.user.findMany({
  where: {
    email: "test@test.com",
    role: "ADMIN"
  }
})`;



const DEFAULT_SCHEMA = `model User {
  id    String @id
  email String
  role  String
}`;



const BOTTOM_TABS: {
  id: BottomTab;
  label: string;
  icon: typeof ListChecks;
}[] = [

  {
    id: "analysis",
    label: "Analysis",
    icon: ListChecks,
  },

  {
    id: "suggestions",
    label: "Suggestions",
    icon: Sparkles,
  },

  {
    id: "ast",
    label: "AST",
    icon: TreePine,
  },

];



export default function Converter() {


  const [mode, setMode] =
    useState<ConverterMode>(
      "prisma-to-sql",
    );



  const [input, setInput] =
    useState(
      DEFAULT_PRISMA,
    );



  const [schema, setSchema] =
    useState(
      DEFAULT_SCHEMA,
    );



  const [output, setOutput] =
    useState("");



  const [analysis, setAnalysis] =
    useState<QueryAnalysis | null>(
      null,
    );



  const [suggestions, setSuggestions] =
    useState<string[]>([]);



  const [ast, setAst] =
    useState<QueryNode | null>(
      null,
    );



  const [activeTab, setActiveTab] =
    useState<BottomTab>(
      "analysis",
    );



  const [showSidebar, setShowSidebar] =
    useState(true);



  const [isConverting, setIsConverting] =
    useState(false);



  const [showSaveDialog, setShowSaveDialog] =
    useState(false);




  const handleConvert =
    useCallback(() => {


      if (!input.trim()) {

        toast.error(
          "Enter a query to convert",
        );

        return;

      }



      setIsConverting(true);



      setTimeout(() => {


        let result = "";

        let parsedAst:
          QueryNode | null = null;


        let newAnalysis:
          QueryAnalysis | null = null;


        let newSuggestions:
          string[] = [];



        if (
          mode === "prisma-to-sql"
        ) {


          result =
            prismaToSql(
              input,
              schema,
            );



          parsedAst =
            parsePrismaQuery(
              input,
            );



          newAnalysis =
            analyzeQuery(
              parsedAst,
            );



          newSuggestions =
            getSuggestions(
              parsedAst,
            );


        } else {


          result =
            sqlToPrisma(
              input,
            );

        }



        setOutput(
          result,
        );


        setAst(
          parsedAst,
        );


        setAnalysis(
          newAnalysis,
        );


        setSuggestions(
          newSuggestions,
        );



        setIsConverting(false);



        saveHistory(
          input,
          result,
          mode,
          newAnalysis,
        );


        toast.success(
          "Query converted",
        );


      },120);



    },[
      input,
      schema,
      mode,
    ]);




  const handleClear =
    useCallback(() => {


      setInput("");

      setSchema("");

      setOutput("");

      setAnalysis(null);

      setSuggestions([]);

      setAst(null);


    },[]);




  const handleSaveSnippet =
    useCallback(() => {


      if (!input.trim()) {

        toast.error(
          "Nothing to save",
        );

        return;

      }


      setShowSaveDialog(true);


    },[
      input,
    ]);




  const handleExampleSelect =
    useCallback(
      (
        query:string,
      ) => {

        setInput(query);

        setOutput("");

        setAnalysis(null);

        setSuggestions([]);

        setAst(null);

      },
      [],
    );




  useKeyboardShortcuts({

    "mod+enter":
      handleConvert,


    "mod+s": () => {

      handleSaveSnippet();

    },

  });



  const inputLanguage =
    mode === "prisma-to-sql"
      ? "typescript"
      : "sql";



  const outputLanguage =
    mode === "prisma-to-sql"
      ? "sql"
      : "typescript";



  const inputLabel =
    mode === "prisma-to-sql"
      ? "Prisma Query"
      : "SQL Query";



  const outputLabel =
    mode === "prisma-to-sql"
      ? "SQL Output"
      : "Prisma Output";



  const hasResults =
    analysis !== null ||
    suggestions.length > 0 ||
    ast !== null;
  
    return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-blue-500"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Query Converter
          </h1>
        </div>


        <div className="flex items-center gap-2">


          <button
            onClick={() =>
              setShowSidebar(!showSidebar)
            }
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 lg:hidden"
          >

            {showSidebar ?
              <PanelLeftClose size={15} />
            :
              <PanelLeftOpen size={15} />
            }

          </button>



          <div className="flex rounded-lg border border-slate-200 p-0.5">


            <button
              onClick={() => {

                setMode(
                  "prisma-to-sql",
                );

                handleClear();

              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                mode === "prisma-to-sql"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600",
              )}
            >
              Prisma → SQL
            </button>



            <button
              onClick={() => {

                setMode(
                  "sql-to-prisma",
                );

                handleClear();

              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                mode === "sql-to-prisma"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600",
              )}
            >
              SQL → Prisma
            </button>


          </div>

        </div>

      </div>





      <div className="flex gap-4">


        {/* Sidebar */}

        <AnimatePresence>

          {showSidebar && (

            <motion.aside
              initial={{
                width:0,
                opacity:0,
              }}
              animate={{
                width:260,
                opacity:1,
              }}
              exit={{
                width:0,
                opacity:0,
              }}
              className="hidden shrink-0 overflow-hidden lg:block"
            >

              <Card className="h-115 overflow-hidden">

                <ExampleSidebar
                  onSelect={
                    handleExampleSelect
                  }
                  direction={mode}
                />

              </Card>


            </motion.aside>

          )}

        </AnimatePresence>







        <div className="flex min-w-0 flex-1 flex-col gap-4">


          {/* Prisma Schema */}

          {mode === "prisma-to-sql" && (

            <Card className="overflow-hidden">


              <div className="border-b border-slate-200 px-4 py-2.5">

                <h2 className="text-sm font-semibold">
                  Prisma Schema
                </h2>

              </div>



              <div className="h-52">

                <CodeEditor
                  language="prisma"
                  value={schema}
                  onChange={setSchema}
                  height="100%"
                />


              </div>


            </Card>

          )}







          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">



            {/* Query */}

            <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">


              <div className="border-b border-slate-200 px-4 py-2.5">

                <h2 className="text-sm font-semibold">
                  {inputLabel}
                </h2>


              </div>



              <div>

                <CodeEditor

                  language={inputLanguage}

                  value={input}

                  onChange={setInput}

                  height="420px"

                />


              </div>


            </Card>






            {/* Convert */}

            <div className="flex items-center justify-center">


              <button

                onClick={handleConvert}

                disabled={isConverting}

                className="flex h-10 w-10 items-center justify-center rounded-full border"

              >

                <ArrowRight size={18}/>


              </button>


            </div>







            {/* Output */}

            <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">


              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">


                <h2 className="text-sm font-semibold">

                  {outputLabel}

                </h2>



                <CopyButton
                  value={output}
                />


              </div>



              <CodeEditor

                language={outputLanguage}

                value={output}

                readOnly

                height="420px"

              />


            </Card>



          </div>



        </div>


      </div>







      {/* Actions */}


      <div className="mt-4 flex flex-wrap gap-2">


        <Button
          onClick={handleConvert}
          disabled={isConverting}
        >

          <AlignLeft size={15}/>

          Convert

        </Button>



        <Button
          variant="secondary"
          onClick={handleSaveSnippet}
        >

          <BookmarkPlus size={15}/>

          Save Snippet

        </Button>



        <Button
          variant="ghost"
          onClick={handleClear}
        >

          <Trash2 size={15}/>

          Clear

        </Button>


      </div>







      {/* Bottom Panels */}

      <AnimatePresence>

        {hasResults && (

          <motion.div
            initial={{
              opacity:0,
              y:10,
            }}
            animate={{
              opacity:1,
              y:0,
            }}
            className="mt-6"
          >

            <Card className="overflow-hidden">


              <div className="flex border-b">


                {BOTTOM_TABS.map(
                  tab => {

                    const Icon =
                      tab.icon;


                    return (

                      <button

                        key={tab.id}

                        onClick={() =>
                          setActiveTab(
                            tab.id,
                          )
                        }

                        className="flex items-center gap-2 px-4 py-3 text-sm"

                      >

                        <Icon size={14}/>

                        {tab.label}


                      </button>

                    );


                  },
                )}


              </div>





              <div className="p-5">


                {activeTab === "analysis" &&
                  analysis && (

                  <AnalysisPanel
                    analysis={analysis}
                  />

                )}



                {activeTab === "suggestions" && (

                  <SuggestionPanel
                    suggestions={suggestions}
                  />

                )}



                {activeTab === "ast" && (

                  <ASTViewer
                    ast={ast}
                  />

                )}



              </div>


            </Card>


          </motion.div>

        )}

      </AnimatePresence>







      <CreateSnippetModal

        open={showSaveDialog}

        onClose={() =>
          setShowSaveDialog(false)
        }


        onSave={(data) => {


          saveSnippet(
            data.name,
            input,
            mode,
            data.tags,
          );


          toast.success(
            "Snippet saved",
          );


          setShowSaveDialog(false);


        }}

      />


    </div>
  );
}