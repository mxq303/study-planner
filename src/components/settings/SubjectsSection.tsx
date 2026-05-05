'use client'

import { useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useI18n } from '@/lib/i18n'
import { useSubjectStore } from '@/stores/subjectStore'
import { Modal } from '@/components/ui/Modal'
import { BookOpen, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
]

const ICONS = [
  'book-open', 'sigma', 'languages', 'atom', 'flask-conical',
  'leaf', 'landmark', 'scroll', 'globe', 'brain',
]

export function SubjectsSection() {
  const { t, locale } = useI18n()
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjectStore()
  const [subjectsRef] = useAutoAnimate()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [newIcon, setNewIcon] = useState('book-open')

  const handleAddSubject = async () => {
    if (!newName.trim()) return
    await addSubject({
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      sortOrder: subjects.length,
      isPreset: false,
    })
    toast.success(locale === 'zh-CN' ? `已添加科目：${newName.trim()}` : `Subject added: ${newName.trim()}`)
    setNewName('')
    setAddModalOpen(false)
  }

  const handleEditSubject = async () => {
    if (!editSubjectId || !newName.trim()) return
    await updateSubject(editSubjectId, {
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
    })
    toast.success(locale === 'zh-CN' ? '科目已更新' : 'Subject updated')
    setEditSubjectId(null)
    setAddModalOpen(false)
  }

  const openEditModal = (id: string) => {
    const s = subjects.find(sub => sub.id === id)
    if (!s) return
    setEditSubjectId(id)
    setNewName(s.name)
    setNewColor(s.color)
    setNewIcon(s.icon)
    setAddModalOpen(true)
  }

  const openAddModal = () => {
    setEditSubjectId(null)
    setNewName('')
    setNewColor('#6366f1')
    setNewIcon('book-open')
    setAddModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text">{t.settings.subjectManagement}</h3>
      </div>

      <div ref={subjectsRef} className="space-y-2">
        {subjects.map(s => (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm"
              style={{ backgroundColor: s.color }}
            >
              {s.name[0]}
            </div>
            <p className="flex-1 text-sm font-medium text-text">{s.name}</p>
            <button
              onClick={() => openEditModal(s.id)}
              className="text-xs text-primary font-medium"
            >
              {locale === 'zh-CN' ? '编辑' : 'Edit'}
            </button>
            <button
              onClick={() => deleteSubject(s.id)}
              className="p-1 text-text-muted hover:text-danger transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={openAddModal}
        className="w-full py-2 border border-dashed border-primary/40 rounded-xl text-sm text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        {t.settings.addSubject}
      </button>

      <Modal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditSubjectId(null) }}
        title={editSubjectId ? t.settings.editSubject : t.settings.addSubject}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.settings.subjectName}</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={locale === 'zh-CN' ? '例如：编程' : 'e.g. Programming'}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm text-text bg-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.settings.color}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? 'var(--color-text)' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.settings.icon}</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewIcon(icon)}
                  className={`px-2 py-1 rounded-lg text-xs border transition ${
                    newIcon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={editSubjectId ? handleEditSubject : handleAddSubject}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
          >
            {editSubjectId ? (locale === 'zh-CN' ? '保存修改' : 'Save Changes') : (locale === 'zh-CN' ? '添加' : 'Add')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
