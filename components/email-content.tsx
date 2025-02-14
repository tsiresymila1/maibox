import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Email } from "@prisma/client";
import { Separator } from "./ui/separator";


export default function EmailContent({ email }: { email?: Email | null }) {
    return <div className="flex-1 bg-card">
        {email ? (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="font-medium">From: {email.from}</p>
                        <p className="text-sm text-muted-foreground">To: {email.to}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {email.date.toLocaleString()}
                    </span>
                </div>
                <Separator className="my-4" />
                <div className="w-full">
                    <Tabs defaultValue="html" className="w-full">
                        <TabsList>
                            <TabsTrigger value="html">HTML</TabsTrigger>
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="raw">Raw</TabsTrigger>
                        </TabsList>
                        <TabsContent value="html" className=" p-2">
                            <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: email.html }} />
                        </TabsContent>
                        <TabsContent value="text" className="p-2">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {email.text}
                            </p>
                        </TabsContent>
                        <TabsContent value="raw" className="p-2">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {email.raw}
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Select an email to read
            </div>
        )}
    </div>
}