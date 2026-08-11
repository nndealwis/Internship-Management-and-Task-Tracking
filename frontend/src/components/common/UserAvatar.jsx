const API_BASE_URL = 'http://localhost:8080'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function UserAvatar({ user, size = 'w-10 h-10', textSize = 'text-sm' }) {
  const name = user?.name || user?.label || ''
  const initials = getInitials(name)

  if (user?.profileImageUrl) {
    const imageUrl = user.profileImageUrl.startsWith('http')
      ? user.profileImageUrl
      : `${API_BASE_URL}${user.profileImageUrl}`
    return (
      <div className={`${size} rounded-full overflow-hidden border border-gray-200 flex-shrink-0`}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div
          className={`${size} rounded-full bg-gray-100 items-center justify-center hidden`}
        >
          <span className={`${textSize} font-medium text-gray-600`}>{initials}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${size} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <span className={`${textSize} font-medium text-gray-600`}>{initials}</span>
    </div>
  )
}

export { getInitials }
export default UserAvatar
