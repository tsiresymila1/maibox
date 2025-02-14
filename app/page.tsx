"use client";

import EmailContent from "@/components/email-content";
import { ThemeToggle } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/use-socket";
import { Email } from "@prisma/client";
import { Mail, MailCheck, RefreshCcw, Search, Trash2 } from "lucide-react";
import Head from "next/head";
import { useCallback, useEffect, useState, useTransition } from "react";
import { deleteAll, getEmails, markAllAsRead, markEmailAsRead } from "./actions/email";

export default function Home() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [search, setSearch] = useState<string>("")
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [unread, setUnread] = useState<number>(0)

    const fetchEmails = async () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const data = await getEmails();
                setEmails(filterEmail(data));
                setUnread(data.filter(e => !e.read).length)
                if (data.length > 0) {
                    setSelectedEmail(data[0])
                }
            } catch (error) {
                console.error("Error fetching emails:", error);
            } finally {
                setLoading(false);
            }
        });
    };

    const handleEmailClick = async (email: Email) => {
        if (!email.read) {
            await markEmailAsRead(email.id);
            setUnread(e => e - 1)
            setEmails(prevEmails =>
                filterEmail(prevEmails).map(e => (e.id === email.id ? { ...e, read: true } : e))
            );
        }
        setSelectedEmail(email);
    };


    const readAll = async () => {
        await markAllAsRead()
        setSelectedEmail(null)
        await fetchEmails()
    }

    const makeEmpty = async () => {
        await deleteAll()
        setSelectedEmail(null)
        await fetchEmails()
    }

    const filterEmail = useCallback((emails: Email[]) => {
        const lowerSearch = search.toLowerCase()
        return emails.filter(e =>
            e.subject.toLowerCase().includes(lowerSearch)
            || e.text.toLowerCase().includes(lowerSearch)
            || e.from.toLowerCase().includes(lowerSearch)
            || e.to.toLowerCase().includes(lowerSearch)
        )
    }, [search])

    const { isConnected } = useSocket(fetchEmails);

    useEffect(() => {
        fetchEmails();
    }, []);

    useEffect(() => {
        document.title = unread > 0 ? `MAILBOX(${unread})` : `MAILBOX`
    }, [unread])

    useEffect(() => {
        setEmails(prevEmails => {
            const emails = filterEmail(prevEmails)
            if (emails.length === 0) {
                setSelectedEmail(null)
            } else {
                setSelectedEmail(emails[0])
            }
            return emails;
        }
        );
    }, [search])
    return (
        <>
            <Head>
                <title>MAILBOX{unread > 0 && `(${unread})`}</title>
            </Head>
            <div className="flex h-screen bg-background">
                {/* Email List */}
                <div className="w-[300px] flex flex-col border-r">
                    <div className="px-4 py-3 border-b bg-cyan-700">
                        <div className="relative flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Mail className="text-white" />
                                    {isConnected && <span className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0"></span>}
                                </div>
                                <h2 className="text-white">MAILBOX ({emails.length})</h2>
                            </div>
                            <div className="flex items-center gap-0 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="focus:bg-transparent hover:bg-transparent px-1"
                                    onClick={readAll}
                                    disabled={isPending}
                                >
                                    <MailCheck className={`h-5 w-5 text-white ${isPending ? "animate-spin" : ""}`} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="focus:bg-transparent hover:bg-transparent px-1"
                                    onClick={fetchEmails}
                                    disabled={isPending}
                                >
                                    <RefreshCcw className={`h-5 w-5 text-white ${isPending ? "animate-spin" : ""}`} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="focus:bg-transparent hover:bg-transparent px-1"
                                    onClick={makeEmpty}
                                    disabled={isPending}
                                >
                                    <Trash2 className={`h-5 w-5 text-white ${isPending ? "animate-spin" : ""}`} />
                                </Button>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails..." className="pl-8 placeholder:text-sm" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="p-4 text-center text-muted-foreground">Loading...</div>
                        ) : emails.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No emails found</div>
                        ) : (
                            emails.map(email => (
                                <div
                                    key={email.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors text-sm ${selectedEmail?.id === email.id ? "bg-muted" : ""
                                        } ${!email.read ? "font-[900] dark:bg-gray-800 bg-gray-100" : "font-normal"}`}
                                    onClick={() => handleEmailClick(email)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm">{email.from}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {email.date.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium mb-1">{email.subject}</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {email.text}
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </div>

                {/* Email Preview */}
                <EmailContent email={selectedEmail} />
            </div>
        </>
    );
}
