import Link from "next/link"
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="container px-4 py-24 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Pricing Plans for BPO Excellence
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            Transform your claims processing workflow with AI-powered automation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Basic</CardTitle>
              <CardDescription>For small claims processing teams</CardDescription>
              <p className="text-3xl font-bold text-white">₹4,999<span className="text-lg font-normal text-gray-400">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  'Up to 1000 claims/month',
                  'Basic sentiment analysis',
                  'Automated callback scheduling',
                  'Standard knowledge base',
                  'Email support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="bg-gradient-to-b from-purple-900 to-gray-900 border-purple-500">
            <CardHeader>
              <div className="py-1 px-3 text-xs bg-purple-500 text-white rounded-full w-fit mb-4">
                RECOMMENDED FOR BPOS
              </div>
              <CardTitle className="text-2xl text-white">Professional</CardTitle>
              <CardDescription>For medium-sized BPO operations</CardDescription>
              <p className="text-3xl font-bold text-white">₹9,999<span className="text-lg font-normal text-gray-400">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  'Up to 5000 claims/month',
                  'Advanced sentiment analysis',
                  'Priority-based scheduling',
                  'AI-powered knowledge base',
                  'Multi-language support',
                  '24/7 priority support',
                  'Performance analytics'
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </CardFooter>
          </Card>  
        </div>
      </div>
    </div>
  )
}