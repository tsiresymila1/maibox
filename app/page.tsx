"use client";

import EmailContent, { EmailWithAttachments } from "@/components/email-content";
import { ThemeToggle } from "@/components/toggle-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/use-socket";
import DOMPurify from "dompurify";
import Favicon from "react-favicon";

import { Bell, LogOut, Mail, MailCheck, RefreshCcw, Search, Trash2 } from "lucide-react";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { logOut } from "./actions/auth";
import { deleteAll, getEmails, markAllAsRead, markEmailAsRead } from "./actions/email";


export default function Home() {
    const [emails, setEmails] = useState<EmailWithAttachments[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<EmailWithAttachments | null>(null);
    const [search, setSearch] = useState<string>("")
    const [searchEmails, setSearchEmails] = useState<EmailWithAttachments[]>([])
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [unread, setUnread] = useState<number>(0)


    const router = useRouter()

    const fetchEmails = async () => {
        setLoading(true);
        setSelectedEmail(null)
        startTransition(async () => {
            try {
                const data = await getEmails();
                setEmails(data)
                setSearchEmails(filterEmail(search, data));
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

    const handleEmailClick = async (email: EmailWithAttachments) => {
        if (!email.read) {
            await markEmailAsRead(email.id);
            setUnread(e => e - 1)
            setSearchEmails(
                filterEmail(search, emails).map(e => (e.id === email.id ? { ...e, read: true } : e))
            );
            setEmails(emails.map(e => (e.id === email.id ? { ...e, read: true } : e)))
        }
        setSelectedEmail(email);
    };


    const readAll = async () => {
        await markAllAsRead()
        await fetchEmails()
    }

    const makeEmpty = async () => {
        await deleteAll()
        await fetchEmails()
    }
    const truncateText = (text: string, length: number = 20) => {
        return text.length > length ? text.slice(0, length) + "..." : text;
    };

    const htmlToString = (html: string) => {
        return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    };

    const filterEmail = (key: string, all: EmailWithAttachments[]) => {
        const lowerSearch = key.toLowerCase()
        return all.filter(e =>
            e.subject.toLowerCase().includes(lowerSearch)
            || e.text.toLowerCase().includes(lowerSearch)
            || e.from.toLowerCase().includes(lowerSearch)
            || e.to.toLowerCase().includes(lowerSearch)
        )
    }

    const loginOut = async () => {
        await logOut()
        router.replace("/login");
    }

    const { isConnected } = useSocket(fetchEmails);

    useEffect(() => {
        fetchEmails();
    }, []);

    useEffect(() => {
        document.title = unread > 0 ? `MAILBOX(${unread})` : `MAILBOX`
    }, [unread])

    useEffect(() => {
        const allEMail = filterEmail(search, emails)
        if (allEMail.length === 0) {
            setSelectedEmail(null)
        } else {
            setSelectedEmail(emails[0])
        }
        setSearchEmails(allEMail);
    }, [search])

    return (
        <>
            <Head>
                <title>MAILBOX{unread > 0 && `(${unread})`}</title>
            </Head>
            <Favicon url='./favicon.ico' alertCount={unread ?? null} />
            <div className="flex h-screen bg-background">
                {/* Email List */}
                <div className="w-[300px] flex flex-col border-r">
                    <div className="px-4 py-3 border-b bg-blue-800">
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
                                    disabled={isPending}
                                >
                                    <Bell size={0} className={`h-5 w-5 text-white`} />
                                    {unread > 0 ? <Badge children={unread} variant="destructive" className="  top-0 absolute right-0 text-sm h-4 p-[2px] text-[10px]" color="red" /> : null}
                                </Button>
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

                        ) : searchEmails.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No emails found</div>
                        ) : (
                            searchEmails.map(email => (
                                <div
                                    key={email.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${selectedEmail?.id === email.id ? "bg-muted" : ""
                                        } ${!email.read ? "font-[900] dark:bg-gray-800 bg-gray-100" : "font-normal"}`}
                                    onClick={() => handleEmailClick(email)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs">{email.from}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {email.date.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium mb-1">{truncateText(email.subject, 30)}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {truncateText(email.text && email.text !== "" ? email.text.toString() : htmlToString(email.html), 30)}
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </div>

                {/* Email Preview */}
                <div className="flex-1 flex flex-col">
                    <div className="w-full bg-blue-800 py-3 px-4 flex flex-row justify-between">
                        <div className="flex-1 gap-2 flex">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="focus:bg-transparent hover:bg-transparent px-1"
                                onClick={readAll}
                                disabled={isPending}
                            >
                                <MailCheck className={`h-4 w-4 text-white`} />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="focus:bg-transparent hover:bg-transparent px-1"
                                onClick={makeEmpty}
                                disabled={isPending}
                            >
                                <Trash2 className={`h-4 w-4 text-white`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="focus:bg-transparent hover:bg-transparent px-1"
                                onClick={fetchEmails}
                                disabled={isPending}
                            >
                                <RefreshCcw className={`h-4 w-4 text-white ${isPending ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                        <div className="flex flex-row gap-2">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="focus:bg-transparent hover:bg-transparent px-1"
                                onClick={loginOut}
                                disabled={isPending}
                            >
                                <LogOut className={`h-4 w-4 text-white`} />
                            </Button>
                        </div>
                    </div>
                    <EmailContent email={selectedEmail} />
                </div>
            </div>
        </>
    );
}
