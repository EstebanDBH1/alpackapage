import React, { useRef, useEffect, useState } from 'react';
import {
    Bold, Italic, Heading2, Heading3, Pilcrow, List, ListOrdered,
    Quote, Link as LinkIcon, ImagePlus, Eraser, Loader2,
} from 'lucide-react';

// Editor visual (WYSIWYG) sin dependencias: contentEditable + execCommand.
// El formato se aplica con botones y se ve tal cual quedará publicado — el
// autor nunca escribe códigos tipo "## título". El HTML resultante se
// sanitiza al renderizar (ver BlogContent), así que el editor puede ser laxo.

interface Props {
    initialHtml: string;
    onChange: (html: string) => void;
    uploadImage: (file: File) => Promise<string>;
    onError?: (message: string) => void;
}

const ToolbarButton: React.FC<{
    title: string;
    onAction: () => void;
    children: React.ReactNode;
}> = ({ title, onAction, children }) => (
    <button
        type="button"
        title={title}
        // mousedown + preventDefault: si el botón robara el foco se perdería
        // la selección de texto y el formato se aplicaría en el lugar equivocado
        onMouseDown={e => { e.preventDefault(); onAction(); }}
        className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
    >
        {children}
    </button>
);

const RichTextEditor: React.FC<Props> = ({ initialHtml, onChange, uploadImage, onError }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // El contenido se inyecta UNA vez al montar: el div es no-controlado para
    // que React no reescriba el HTML en cada tecla (eso saltaría el cursor).
    useEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = initialHtml;
        try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* no-op */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emitChange = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const exec = (command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        emitChange();
    };

    const insertLink = () => {
        const url = window.prompt('URL del enlace (con https://):');
        if (!url) return;
        exec('createLink', url);
    };

    const handleImageUpload = async (file: File | undefined) => {
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file);
            exec('insertImage', url);
        } catch (e: any) {
            onError?.(`Error al subir la imagen: ${e?.message ?? e}`);
        } finally {
            setUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    // Pegar siempre como texto plano: evita arrastrar estilos rotos de Word/webs
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        emitChange();
    };

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-accent">
            {/* Barra de herramientas */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-secondary/40 px-2 py-1.5">
                <ToolbarButton title="Título" onAction={() => exec('formatBlock', '<h2>')}>
                    <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton title="Subtítulo" onAction={() => exec('formatBlock', '<h3>')}>
                    <Heading3 size={16} />
                </ToolbarButton>
                <ToolbarButton title="Párrafo normal" onAction={() => exec('formatBlock', '<p>')}>
                    <Pilcrow size={16} />
                </ToolbarButton>

                <span className="mx-1.5 h-5 w-px bg-border" />

                <ToolbarButton title="Negrita" onAction={() => exec('bold')}>
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton title="Cursiva" onAction={() => exec('italic')}>
                    <Italic size={16} />
                </ToolbarButton>

                <span className="mx-1.5 h-5 w-px bg-border" />

                <ToolbarButton title="Lista" onAction={() => exec('insertUnorderedList')}>
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton title="Lista numerada" onAction={() => exec('insertOrderedList')}>
                    <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton title="Cita" onAction={() => exec('formatBlock', '<blockquote>')}>
                    <Quote size={16} />
                </ToolbarButton>

                <span className="mx-1.5 h-5 w-px bg-border" />

                <ToolbarButton title="Enlace" onAction={insertLink}>
                    <LinkIcon size={16} />
                </ToolbarButton>
                <button
                    type="button"
                    title="Insertar imagen"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                </button>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageUpload(e.target.files?.[0])}
                />

                <span className="mx-1.5 h-5 w-px bg-border" />

                <ToolbarButton title="Quitar formato" onAction={() => { exec('removeFormat'); exec('formatBlock', '<p>'); }}>
                    <Eraser size={16} />
                </ToolbarButton>
            </div>

            {/* Área de escritura: mismo estilo que el artículo publicado */}
            <div
                ref={editorRef}
                contentEditable
                onInput={emitChange}
                onBlur={emitChange}
                onPaste={handlePaste}
                spellCheck
                className="blog-prose min-h-[340px] max-h-[70vh] overflow-y-auto px-5 py-4 text-sm focus:outline-none"
            />
        </div>
    );
};

export default RichTextEditor;
