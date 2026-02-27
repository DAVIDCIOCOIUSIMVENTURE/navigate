// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { getNavigationItem } from "@/config/navigation"
// import { Button } from "@/components/ui/button"
// import { X, ChevronRight } from "lucide-react"
// import { useState, useEffect } from "react"
// import { Input } from "@/components/ui/input"
// import Link from "next/link"
// import nlp from "compromise"
// import { Toaster } from "sonner"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { toast } from "sonner"

// /**
//  * Utility function to check for duplicates using the compromise library
//  * 
//  * How compromise works:
//  * 1. It breaks down text into terms (words) and normalizes them
//  * 2. It can identify parts of speech and extract key terms
//  * 3. It helps compare text similarity by analyzing term overlap
//  * 
//  * In our implementation:
//  * - We use a threshold of 0.4 (40% similarity) to determine duplicates
//  * - This means entries need to share 40% of their terms to be considered duplicates
//  * - We only block exact duplicates (same terms in same order)
//  * - We allow variations (e.g., "Web Dev" and "Web Development" are allowed)
//  * - We check for duplicates across ALL questions, not just within the same question
//  * 
//  * Example:
//  * - "Web Development" -> terms: ["web", "development"]
//  * - "Web Dev" -> terms: ["web", "dev"]
//  * - These would be allowed as they're different enough
//  * 
//  * But:
//  * - "Web Development" and "Web Development" -> blocked (exact duplicate)
//  * - "Programming" and "Programming" -> blocked (exact duplicate)
//  */
// const checkForDuplicates = (newItem: string, allAnswers: Record<string, string[]>): { isDuplicate: boolean; similarItems: { question: string; items: string[] }[] } => {
//   // Normalize the new item (lowercase and trim)
//   const normalizedNewItem = newItem.toLowerCase().trim()

//   // First check for exact matches (case-insensitive)
//   const similarItems: { question: string; items: string[] }[] = []

//   // Check across all questions
//   Object.entries(allAnswers).forEach(([questionId, items]) => {
//     const matchingItems = items.filter(item => {
//       const normalizedExisting = item.toLowerCase().trim()

//       // Check for exact match
//       if (normalizedExisting === normalizedNewItem) {
//         return true
//       }

//       // Use compromise to analyze both items
//       const newDoc = nlp(normalizedNewItem)
//       const existingDoc = nlp(normalizedExisting)

//       // Extract terms from both items
//       const newTerms = newDoc.terms().out('array') as string[]
//       const existingTerms = existingDoc.terms().out('array') as string[]

//       // Check if any terms match exactly
//       if (newTerms.some((term: string) => existingTerms.includes(term)) ||
//         existingTerms.some((term: string) => newTerms.includes(term))) {
//         return true
//       }

//       // Calculate similarity using term overlap
//       const newTermsSet = new Set(newTerms)
//       const existingTermsSet = new Set(existingTerms)
//       const intersection = new Set([...newTermsSet].filter(term => existingTermsSet.has(term)))
//       const union = new Set([...newTermsSet, ...existingTermsSet])
//       const similarity = intersection.size / union.size

//       // Return true if similarity is above threshold (0.4 = 40%)
//       return similarity > 0.4
//     })

//     if (matchingItems.length > 0) {
//       similarItems.push({
//         question: questionId,
//         items: matchingItems
//       })
//     }
//   })

//   return {
//     isDuplicate: similarItems.length > 0,
//     similarItems
//   }
// }

// interface DuplicateConfirmationModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onConfirm: () => void
//   newItem: string
//   similarItems: { question: string; items: string[] }[]
//   categories: Category[]
// }

// function DuplicateConfirmationModal({
//   isOpen,
//   onClose,
//   onConfirm,
//   newItem,
//   similarItems,
//   categories
// }: DuplicateConfirmationModalProps) {
//   // Helper function to get question title from ID
//   const getQuestionTitle = (questionId: string) => {
//     for (const category of categories) {
//       const question = category.questions.find(q => q.id === questionId)
//       if (question) return question.title
//     }
//     return questionId
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Potential Duplicate</DialogTitle>
//           <DialogDescription>
//             The term &quot;{newItem}&quot; might be similar to existing entries in other questions. Are you sure you want to add it?
//           </DialogDescription>
//         </DialogHeader>
//         <div className="py-4 space-y-4">
//           {similarItems.map(({ question, items }) => (
//             <div key={question}>
//               <p className="text-sm font-medium text-gray-700 mb-2">{getQuestionTitle(question)}:</p>
//               <div className="flex flex-wrap gap-2">
//                 {items.map((item, index) => (
//                   <div
//                     key={index}
//                     className="px-2 py-1 bg-gray-100 rounded-full text-sm"
//                   >
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={onConfirm}>
//             Add Anyway
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// interface IdeaTrigger {
//   id: string
//   title: string
//   userId: string
//   selfDiscoveryQuestionId: string
// }

// interface Question {
//   id: string
//   title: string
//   description: string
//   selfDiscoveryQuestionCategoryId: string
// }

// interface Category {
//   id: string
//   title: string
//   questions: Question[]
// }

// const SDG_GOALS = [
//   "No poverty",
//   "Zero hunger",
//   "Good health and well-being",
//   "Quality Education",
//   "Gender equality",
//   "Clean water and sanitation",
//   "Affordable and clean energy",
//   "Decent work and economic growth",
//   "Industry innovation and infrastructure",
//   "Reduced inequalities",
//   "Sustainable cities and communities",
//   "Responsible consumption and production",
//   "Climate action",
//   "Life below water",
//   "Life on land",
//   "Peace justice and strong institutions",
//   "Partnerships for the goals"
// ]

// export default function SelfDiscoveryQuestionsPage() {
//   const navItem = getNavigationItem("/self-discovery")
//   const Icon = navItem?.icon
//   const [answers, setAnswers] = useState<Record<string, string[]>>({})
//   const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({})
//   const [duplicateModal, setDuplicateModal] = useState<{
//     isOpen: boolean
//     question: string
//     value: string
//     similarItems: { question: string; items: string[] }[]
//   } | null>(null)
//   const [categories, setCategories] = useState<Category[]>([])

//   // Load categories and answers when the page loads
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // TODO: Replace with actual user ID from auth
//         const userId = "1"

//         // Load categories and questions
//         const [categoriesResponse, questionsResponse] = await Promise.all([
//           // fetch("http://localhost:3001/selfDiscoveryQuestionCategories"),
//           // fetch("http://localhost:3001/selfDiscoveryQuestions")
//           fetch("/api/selfDiscoveryQuestionCategories"),
//           fetch("/api/selfDiscoveryQuestions")
//         ])

//         const categoriesData = await categoriesResponse.json()
//         const questionsData = await questionsResponse.json()

//         // Combine categories with their questions
//         const categoriesWithQuestions = categoriesData.map((category: Category) => ({
//           ...category,
//           questions: questionsData.filter((question: Question) =>
//             question.selfDiscoveryQuestionCategoryId === category.id
//           )
//         }))

//         setCategories(categoriesWithQuestions)

//         // Load existing triggers
//         const triggersResponse = await fetch(`/api/problemTriggers?userId=${userId}`)
//         const triggers = await triggersResponse.json() as IdeaTrigger[]

//         // Group triggers by question ID
//         const groupedAnswers = triggers.reduce((acc: Record<string, string[]>, trigger: IdeaTrigger) => {
//           if (!acc[trigger.selfDiscoveryQuestionId]) {
//             acc[trigger.selfDiscoveryQuestionId] = []
//           }
//           acc[trigger.selfDiscoveryQuestionId].push(trigger.title)
//           return acc
//         }, {})

//         setAnswers(groupedAnswers)
//       } catch (error) {
//         console.error("Error loading data:", error)
//         toast.error("Failed to load data")
//       }
//     }

//     loadData()
//   }, [])

//   const saveTrigger = async (title: string, questionId: string) => {
//     try {
//       // TODO: Replace with actual user ID from auth
//       const userId = "1"

//       // Find the category for this question
//       const category = categories.find(cat =>
//         cat.questions.some(q => q.id === questionId)
//       )
//       if (!category) return

//       await fetch("/api/problemTriggers", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           title,
//           userId,
//           selfDiscoveryQuestionId: questionId
//         })
//       })
//     } catch (error) {
//       console.error("Error saving trigger:", error)
//       toast.error("Failed to save answer")
//     }
//   }

//   const deleteTrigger = async (title: string, questionId: string) => {
//     try {
//       // TODO: Replace with actual user ID from auth
//       const userId = "1"

//       // Find the trigger to delete
//       const triggers = await fetch(`/api/problemTriggers?userId=${userId}&title=${title}&selfDiscoveryQuestionId=${questionId}`).then(res => res.json()) as IdeaTrigger[]
//       if (triggers.length > 0) {
//         await fetch(`/api/problemTriggers/${triggers[0].id}`, {
//           method: "DELETE"
//         })
//       }
//     } catch (error) {
//       console.error("Error deleting trigger:", error)
//       toast.error("Failed to delete answer")
//     }
//   }

//   const addItemToAnswers = async (question: string, value: string) => {
//     // Save to database
//     await saveTrigger(value, question)

//     // Update local state
//     setAnswers(prev => ({
//       ...prev,
//       [question]: [...(prev[question] || []), value]
//     }))

//     // Clear the input after adding
//     setCurrentInputs(prev => ({
//       ...prev,
//       [question]: ""
//     }))
//   }

//   const handleRemoveItem = async (question: string, index: number) => {
//     const itemToRemove = answers[question][index]

//     // Delete from database
//     await deleteTrigger(itemToRemove, question)

//     // Update local state
//     setAnswers(prev => ({
//       ...prev,
//       [question]: prev[question].filter((_, i) => i !== index)
//     }))
//   }

//   const handleAddItem = (question: string, value: string) => {
//     const trimmedValue = value.trim()
//     if (!trimmedValue) return

//     // Skip duplicate detection for predefined SDGs
//     if (question === "sustainability-goals" && SDG_GOALS.includes(value)) {
//       addItemToAnswers(question, trimmedValue)
//       return
//     }

//     const { isDuplicate, similarItems } = checkForDuplicates(trimmedValue, answers)

//     if (isDuplicate) {
//       setDuplicateModal({
//         isOpen: true,
//         question,
//         value: trimmedValue,
//         similarItems
//       })
//       return
//     }

//     addItemToAnswers(question, trimmedValue)
//   }

//   const handleConfirmDuplicate = () => {
//     if (duplicateModal) {
//       addItemToAnswers(duplicateModal.question, duplicateModal.value)
//       setDuplicateModal(null)
//     }
//   }

//   const handleInputChange = (question: string, value: string) => {
//     setCurrentInputs(prev => ({
//       ...prev,
//       [question]: value
//     }))
//   }

//   const handleKeyPress = (e: React.KeyboardEvent, question: string) => {
//     if (e.key === "Enter") {
//       e.preventDefault()
//       const input = currentInputs[question]?.trim()
//       if (input) {
//         handleAddItem(question, input)
//       }
//     }
//   }

//   return (
//     <div className="flex gap-8 max-w-7xl mx-auto px-4 py-8">
//       <Toaster />
//       {duplicateModal && (
//         <DuplicateConfirmationModal
//           isOpen={duplicateModal.isOpen}
//           onClose={() => setDuplicateModal(null)}
//           onConfirm={handleConfirmDuplicate}
//           newItem={duplicateModal.value}
//           similarItems={duplicateModal.similarItems}
//           categories={categories}
//         />
//       )}
//       <div className="flex-1">
//         <div className="sticky top-16 z-40 bg-background pt-4 pb-6">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               {navItem && Icon && (
//                 <div className="flex items-center justify-center w-10 h-10 rounded-lg">
//                   <Icon className="h-6 w-6" />
//                 </div>
//               )}
//               <h2 className="text-xl font-bold">Self Discovery Questions</h2>
//             </div>

//             <Link href="/self-discovery/buckets">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-purple-500 hover:bg-purple-400 text-white hover:text-white border-purple-500"
//               >
//                 Continue to Self Discovery Buckets
//                 <ChevronRight className="ml-2 h-4 w-4" />
//               </Button>
//             </Link>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {categories.map((category) => (
//             <Card key={category.id}>
//               <CardHeader>
//                 <CardTitle>{category.title}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-6 text-gray-600">
//                   {category.questions.map((question) => (
//                     <li key={question.id} className="space-y-4">
//                       <div className="space-y-2">
//                         <p className="font-medium">{question.title}</p>
//                         <p className="text-sm text-gray-500">{question.description}</p>
//                       </div>
//                       {question.id === "4" ? (
//                         <>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {SDG_GOALS.map((goal) => (
//                               <Button
//                                 key={goal}
//                                 variant={answers[question.id]?.includes(goal) ? "default" : "outline"}
//                                 className="justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm"
//                                 onClick={async () => {
//                                   if (answers[question.id]?.includes(goal)) {
//                                     await handleRemoveItem(question.id, answers[question.id].indexOf(goal))
//                                   } else {
//                                     await addItemToAnswers(question.id, goal)
//                                   }
//                                 }}
//                               >
//                                 {goal}
//                               </Button>
//                             ))}
//                           </div>
//                           <div className="mt-4">
//                             <p className="text-sm text-gray-500 mb-2">Or add your own sustainability goal:</p>
//                             <div className="flex gap-2">
//                               <Input
//                                 placeholder="Add a custom sustainability goal..."
//                                 value={currentInputs[question.id] || ""}
//                                 onChange={(e) => handleInputChange(question.id, e.target.value)}
//                                 onKeyPress={(e) => handleKeyPress(e, question.id)}
//                               />
//                               <Button onClick={async () => {
//                                 const input = currentInputs[question.id]?.trim()
//                                 if (input) {
//                                   await addItemToAnswers(question.id, input)
//                                 }
//                               }}>Add</Button>
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <>
//                           <div className="flex gap-2">
//                             <Input
//                               placeholder={`Add ${question.title.toLowerCase()}...`}
//                               value={currentInputs[question.id] || ""}
//                               onChange={(e) => handleInputChange(question.id, e.target.value)}
//                               onKeyPress={(e) => handleKeyPress(e, question.id)}
//                             />
//                             <Button onClick={() => handleAddItem(question.id, currentInputs[question.id] || "")}>Add</Button>
//                           </div>
//                         </>
//                       )}
//                       <div className="flex flex-wrap gap-2">
//                         {answers[question.id]?.map((item, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
//                           >
//                             <span>{item}</span>
//                             <button
//                               onClick={() => handleRemoveItem(question.id, index)}
//                               className="text-gray-500 hover:text-gray-700"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       <div className="w-80 shrink-0">
//         <Card className="sticky top-24">
//           <CardHeader>
//             <CardTitle>Your Answers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {categories.map((category) => (
//                 <div key={category.id}>
//                   <h3 className="font-medium mb-2">{category.title}</h3>
//                   <div className="space-y-2">
//                     {category.questions.map((question) => (
//                       answers[question.id]?.length > 0 && (
//                         <div key={question.id}>
//                           <p className="text-sm text-gray-500 mb-1">{question.title}</p>
//                           <div className="flex flex-wrap gap-1">
//                             {answers[question.id].map((item, index) => (
//                               <div key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
//                                 <span>{item}</span>
//                                 <button
//                                   onClick={() => handleRemoveItem(question.id, index)}
//                                   className="text-gray-500 hover:text-gray-700"
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* <div className="fixed bottom-8 right-8">
//         <Link href="/self-discovery/buckets">
//           <Button
//             size="lg"
//             className="shadow-lg bg-purple-500 hover:bg-purple-400 text-white"
//           >
//             Continue to Self Discovery Buckets
//             <ChevronRight className="ml-2 h-5 w-5" />
//           </Button>
//         </Link>
//       </div> */}
//     </div>
//   )
// } 