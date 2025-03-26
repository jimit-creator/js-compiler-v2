import { useState, memo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check,
  CopyIcon,
  FacebookIcon, 
  LinkedinIcon, 
  TwitterIcon,
  Link2,
  MessageSquare,
  Mail
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from 'qrcode.react';
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

const ShareModal = memo(({ isOpen, onClose, code }: ShareModalProps) => {
  const [title, setTitle] = useState("My JavaScript Code");
  const [description, setDescription] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState<Record<string, boolean>>({
    link: false,
    embed: false
  });
  const [activeTab, setActiveTab] = useState("link");

  // Create a mutation for saving the code
  const saveCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/snippets', {
        code,
        title,
        description,
        language: 'javascript'
      });
      return response.json();
    },
    onSuccess: (data) => {
      const link = `${window.location.origin}/s/${data.shareId}`;
      setShareLink(link);
      toast({
        title: "Code shared successfully!",
        description: "Your code has been saved and can be accessed via the share link.",
      });
      // Navigate but don't close modal
      navigate(`/s/${data.shareId}`, { replace: true });
    },
    onError: () => {
      toast({
        title: "Failed to share code",
        description: "There was an error while trying to share your code.",
        variant: "destructive",
      });
    }
  });

  const handleSaveAndShare = useCallback(() => {
    if (!code.trim()) {
      toast({
        title: "Cannot share empty code",
        description: "Please write some code before sharing.",
        variant: "destructive",
      });
      return;
    }
    
    saveCodeMutation.mutate();
  }, [code, toast, title, description, saveCodeMutation]);

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    
    toast({
      title: "Copied to clipboard!",
      description: `${type === 'link' ? 'Share link' : 'Embed code'} has been copied to your clipboard.`,
    });
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [type]: false }));
    }, 2000);
  }, [toast]);

  const embedCode = `<iframe 
  src="${window.location.origin}/embed/${shareLink.split('/').pop()}" 
  width="100%" 
  height="400" 
  style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
  title="${title || 'JavaScript Code'}"
  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
  frameborder="0"></iframe>`;

  const shareToSocial = useCallback((platform: string) => {
    if (!shareLink) return;
    
    let url = '';
    const text = encodeURIComponent(`${title}${description ? ': ' + description : ''}`);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`JavaScript Code: ${title}`)}&body=${encodeURIComponent(`Check out this JavaScript code: ${title}\n\n${shareLink}`)}`;
        break;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [shareLink, title, description]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Share Your Code
            {saveCodeMutation.isPending && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                Saving...
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Save and share your code with others
          </DialogDescription>
        </DialogHeader>
        
        {!shareLink ? (
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter a title for your code"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Briefly describe what your code does"
                  rows={2}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveAndShare} 
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              disabled={saveCodeMutation.isPending}
            >
              {saveCodeMutation.isPending ? "Generating Share Link..." : "Save & Generate Share Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="link" className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  <span>Link</span>
                </TabsTrigger>
                <TabsTrigger value="embed" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Embed</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-1">
                  <TwitterIcon className="h-4 w-4" />
                  <span>Share</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="share-link">Share Link</Label>
                  <div className="flex">
                    <Input 
                      id="share-link"
                      value={shareLink}
                      readOnly
                      className="rounded-r-none text-sm font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button 
                      className={cn(
                        "rounded-l-none transition-all", 
                        copied.link && "bg-green-500 hover:bg-green-600"
                      )}
                      onClick={() => copyToClipboard(shareLink, 'link')}
                    >
                      {copied.link ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <CopyIcon className="h-4 w-4 mr-1" />
                      )}
                      {copied.link ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm border">
                    <QRCodeSVG 
                      value={shareLink} 
                      size={150}
                      level="H"
                      includeMargin={true}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="embed" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="embed-code">Embed Code</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-xs", 
                        copied.embed && "text-green-500"
                      )}
                      onClick={() => copyToClipboard(embedCode, 'embed')}
                    >
                      {copied.embed ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3 w-3 mr-1" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea 
                      id="embed-code" 
                      readOnly 
                      value={embedCode}
                      rows={6}
                      className="font-mono text-xs p-3 resize-none"
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <div className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-center text-muted-foreground p-4">
                      Embed preview will appear here
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-2">
                  <Label>Share on Social Media</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-10"
                            onClick={() => shareToSocial('facebook')}
                          >
                            <FacebookIcon className="h-5 w-5" />
                            <span>Facebook</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share to Facebook</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2 h-10"
                            onClick={() => shareToSocial('twitter')}
                          >
                            <TwitterIcon className="h-5 w-5" />
                            <span>Twitter</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share to Twitter</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-2 h-10"
                            onClick={() => shareToSocial('linkedin')}
                          >
                            <LinkedinIcon className="h-5 w-5" />
                            <span>LinkedIn</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share to LinkedIn</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2 h-10"
                            onClick={() => shareToSocial('email')}
                          >
                            <Mail className="h-5 w-5" />
                            <span>Email</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share via Email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

ShareModal.displayName = "ShareModal";
export default ShareModal;
