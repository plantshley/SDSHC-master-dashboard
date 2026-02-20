import { useEffect, useState, useCallback } from 'react'
import { formatCurrencyFull } from '../../utils/formatters'
import './ProfileModal.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function getTagClass(role) {
  const r = role.toLowerCase()
  if (r.includes('donor')) return 'profile-tag--donor'
  if (r.includes('vendor')) return 'profile-tag--vendor'
  if (r.includes('cost-share') || r.includes('costshare')) return 'profile-tag--costshare'
  return ''
}

function Section({ title, children }) {
  return (
    <div className="profile-section">
      <div className="profile-section-title">{title}</div>
      {children}
    </div>
  )
}

function ContactRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="profile-contact-row">
      <span className="profile-contact-icon">{icon}</span>
      <div className="profile-contact-content">
        <span className="profile-contact-label">{label}</span>
        <span className="profile-contact-value">{value}</span>
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return null
  if (d instanceof Date && !isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (typeof d === 'object' && d.y) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[d.m - 1] || ''} ${d.d}, ${d.y}`
  }
  return String(d)
}

export default function ProfileModal({ person, onClose }) {
  const [copiedText, setCopiedText] = useState(null)

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const copyToClipboard = useCallback((text) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 1500)
    })
  }, [])

  if (!person) return null

  const roles = person.relationship
    ? person.relationship.split(',').map((r) => r.trim()).filter(Boolean)
    : []

  const address = [person.street, person.streetII, person.city, person.state, person.zipcode]
    .filter(Boolean).join(', ')

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{getInitials(person.fullName)}</div>
          <div className="profile-identity">
            <h2 className="profile-name profile-copyable" onClick={() => copyToClipboard(person.fullName)} title="Click to copy">{person.fullName}</h2>
            <div className="profile-tags">
              {roles.map((role) => (
                <span key={role} className={`profile-tag ${getTagClass(role)}`}>{role}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="profile-quicklinks">
          <div className="profile-section-title">Quick Links</div>
          <div className="profile-links">
            {person.recordUrl && (
              <a href={person.recordUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn profile-link--record" onClick={(e) => e.stopPropagation()}>
                View/Edit Record
              </a>
            )}
            {person.hasDonorHistory && (
              <a href={person.donorUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn profile-link--donor" onClick={(e) => e.stopPropagation()}>
                Donor History
              </a>
            )}
            {person.hasVendorHistory && (
              <a href={person.vendorUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn profile-link--vendor" onClick={(e) => e.stopPropagation()}>
                Vendor History
              </a>
            )}
            {person.hasCostShareHistory && (
              <a href={person.costShareUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn profile-link--costshare" onClick={(e) => e.stopPropagation()}>
                Cost-share History
              </a>
            )}
          </div>
        </div>

        {/* Two-column body */}
        <div className="profile-body">
          {/* Left column: Financial + Membership */}
          <div className="profile-col">
            <Section title="Financial Overview">
              <div className="profile-financials">
                <div className="profile-fin-item">
                  <div className="profile-fin-value">{formatCurrencyFull(person.lifetimeGiftAmount)}</div>
                  <div className="profile-fin-label">Lifetime Giving</div>
                </div>
                <div className="profile-fin-item">
                  <div className="profile-fin-value">{formatCurrencyFull(person.lifetimeVendingTotal)}</div>
                  <div className="profile-fin-label">Lifetime Vending</div>
                </div>
                <div className="profile-fin-item">
                  <div className="profile-fin-value">{formatCurrencyFull(person.lifetimeCostshareTotal)}</div>
                  <div className="profile-fin-label">Lifetime Cost-share</div>
                </div>
              </div>
              <div className="profile-fin-details">
                {person.lastGiftAmount > 0 && (
                  <div className="profile-fin-detail">
                    <span className="profile-fin-detail-label">Last Gift</span>
                    <span className="profile-fin-detail-value">
                      {formatCurrencyFull(person.lastGiftAmount)}
                      {person.lastGiftType && ` \u00b7 ${person.lastGiftType}`}
                      {person.lastGiftDate && ` \u00b7 ${formatDate(person.lastGiftDate)}`}
                    </span>
                  </div>
                )}
                {person.thankYouSent && (
                  <div className="profile-fin-detail">
                    <span className="profile-fin-detail-label">Thank You</span>
                    <span className="profile-fin-detail-value">{person.thankYouSent}</span>
                  </div>
                )}
                {person.lastTransactionYear > 0 && (
                  <div className="profile-fin-detail">
                    <span className="profile-fin-detail-label">Last Transaction</span>
                    <span className="profile-fin-detail-value">{person.lastTransactionYear}</span>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Membership">
              <div className="profile-membership-info">
                {person.membershipStatus && (
                  <div className="profile-membership-row">
                    <span className="profile-membership-label">Status</span>
                    <span className={`profile-status-badge profile-status--${(person.membershipStatus || '').toLowerCase()}`}>
                      {person.membershipStatus}
                    </span>
                  </div>
                )}
                {person.lastMembershipYear > 0 && (
                  <div className="profile-membership-row">
                    <span className="profile-membership-label">Last Year</span>
                    <span className="profile-membership-value">{person.lastMembershipYear}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Right column: Contact */}
          <div className="profile-col">
            <Section title="Contact">
              <div className="profile-contact-list">
                <div className="profile-contact-row profile-copyable" onClick={() => copyToClipboard(person.fullName)} title="Click to copy">
                  <span className="profile-contact-icon">{'\u270d'}</span>
                  <div className="profile-contact-content">
                    <span className="profile-contact-label">Full Name</span>
                    <span className="profile-contact-value">{person.fullName}</span>
                  </div>
                </div>
                {person.email && (
                  <div className="profile-contact-row profile-copyable" onClick={() => copyToClipboard(person.email)} title="Click to copy">
                    <span className="profile-contact-icon">{'\u2709'}</span>
                    <div className="profile-contact-content">
                      <span className="profile-contact-label">Email</span>
                      <span className="profile-contact-value">{person.email}</span>
                    </div>
                  </div>
                )}
                <ContactRow icon={'\u260e'} label="Phone" value={person.phone} />
                {(address || person.primaryAddress) && (
                  <div className="profile-contact-row profile-copyable" onClick={() => copyToClipboard(address || person.primaryAddress)} title="Click to copy">
                    <span className="profile-contact-icon">{'\u2616'}</span>
                    <div className="profile-contact-content">
                      <span className="profile-contact-label">Address</span>
                      <span className="profile-contact-value">{address || person.primaryAddress}</span>
                    </div>
                  </div>
                )}
                <ContactRow icon={'\u270e'} label="Preference" value={person.contactPreference} />
                <ContactRow icon={'\u2709'} label="Newsletter" value={person.newsletterStatus} />
              </div>
            </Section>
          </div>
        </div>

        {copiedText && <div className="profile-copied-toast">Copied to clipboard</div>}
      </div>
    </div>
  )
}
