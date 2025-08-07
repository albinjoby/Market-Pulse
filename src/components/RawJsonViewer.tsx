import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RawJsonViewerProps {
  data: Record<string, unknown> | object;
  title?: string;
}

const RawJsonViewer: React.FC<RawJsonViewerProps> = ({
  data,
  title = "Raw JSON Response",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "JSON data copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 bg-gradient-glass border-card-border backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 p-0 h-auto font-semibold text-foreground hover:text-primary"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {title}
        </Button>
        {isExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3">
          <pre className="bg-muted/30 p-4 rounded-md overflow-x-auto text-xs text-foreground/80 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {jsonString}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default RawJsonViewer;
