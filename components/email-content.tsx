import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Attachment, Email } from "@prisma/client";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export type EmailWithAttachments = Email & { attachments?: Attachment[] }

export default function EmailContent({ email }: { email?: EmailWithAttachments | null }) {
    return <div className="flex-1">
        {email ? (
            <div className="p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-2">{email.subject}</h2>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="font-medium text-sm">From: {email.from}</p>
                        <p className="text-sm text-muted-foreground">To: {email.to}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {email.date.toLocaleString()}
                    </span>
                </div>
                <Separator className="my-4" />
                <div className="w-full flex-1">
                    <Tabs defaultValue={email.html && email.html !== '' ? 'html' : 'text'} className="w-full ">
                        <TabsList>
                            <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
                            <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                            <TabsTrigger value="raw" className="text-xs">Raw</TabsTrigger>
                            <TabsTrigger value="files" className="text-xs">Attachments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="html" className=" p-2 border-none ">
                            <p className="text-xs leading-relaxed max-h-[80vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: email.html }} />
                        </TabsContent>
                        <TabsContent value="text" className="p-2">
                            <ScrollArea className="text-xs leading-relaxed whitespace-pre-wrap max-h-[80vh] overflow-y-auto ">
                                {email.text}
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="raw" className="p-2">
                            <ScrollArea className="text-xs leading-relaxed whitespace-pre-wrap max-h-[80vh] overflow-y-auto pb-2">
                                {email.raw}
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="files" className="p-2">
                            <ScrollArea className="text-xs leading-relaxed whitespace-pre-wrap gap-2 flex  max-h-[80vh] overflow-y-auto">
                                {email.attachments?.map(e => {
                                    return <a
                                        key={e.id}
                                        target="_blank"
                                        className="underline px-4 py-8 rounded-sm bg-muted"
                                        href={`/uploads/${e.fileUrl}`}
                                    >{e.fileName}</a>
                                })}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Select an email to read
            </div>
        )}
    </div>
}