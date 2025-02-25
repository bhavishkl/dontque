'use client'

import { Tooltip, Card, CardBody } from "@nextui-org/react"
import { getMultiLanguageText } from '@/app/utils/transliteration'

/**
 * A tooltip component that displays a name in multiple languages
 * @param {Object} props - Component props
 * @param {string} props.name - The original name to translate
 * @param {React.ReactNode} props.children - The trigger element
 * @returns {React.ReactNode}
 */
export default function LanguageInfoTooltip({ name, children }) {
  if (!name) return children;
  
  const translations = getMultiLanguageText(name);
  
  return (
    <Tooltip
      content={
        <Card className="border-none bg-transparent shadow-none">
          <CardBody className="p-2">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">English:</span>
                <span>{translations.original || ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">ಕನ್ನಡ:</span>
                <span>{translations.kannada || ''}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      }
      placement="top"
      delay={500}
      closeDelay={0}
    >
      {children}
    </Tooltip>
  );
} 