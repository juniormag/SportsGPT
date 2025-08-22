"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { ChatInterface } from "@/components/chat-interface"
import { PageTransition } from "@/components/loading-spinner"

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "chat">("landing")
  const [chatData, setChatData] = useState<{
    question?: string
    selectedTeams?: string[]
  }>({})
  
  const handleSendMessage = (message: string, selectedTeams: string[]) => {
    setChatData({ question: message, selectedTeams })
    setCurrentView("chat")
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
    setChatData({})
    // Força uma "limpeza" completa ao resetar com nova key
  }

  if (currentView === "chat") {
    return (
      <PageTransition>
        <ChatInterface
          initialQuestion={chatData.question}
          selectedTeams={chatData.selectedTeams}
          onBack={handleBackToLanding}
        />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <LandingPage
        onSendMessage={handleSendMessage}
      />
    </PageTransition>
  )
}