import React, { useState } from 'react';
import { Home, Bell, User, Menu, Search, TrendingUp, MessageCircle, Share2, Bookmark, MoreHorizontal, ChevronUp, Award, Eye, ArrowLeft, Send } from 'lucide-react';

const RedditMobile = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showSubredditMenu, setShowSubredditMenu] = useState(false);
  const [selectedSort, setSelectedSort] = useState('hot');
  const [votedPosts, setVotedPosts] = useState({});
  const [currentView, setCurrentView] = useState('feed');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [votedComments, setVotedComments] = useState({});
  const [subredditSearch, setSubredditSearch] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [commentSort, setCommentSort] = useState('best');

  const subreddits = [
    { name: 'r/technology', members: '14.2M', icon: '💻', color: '#FF4500' },
    { name: 'r/gaming', members: '37.8M', icon: '🎮', color: '#0079D3' },
    { name: 'r/science', members: '30.1M', icon: '🔬', color: '#46D160' },
    { name: 'r/movies', members: '28.5M', icon: '🎬', color: '#FF4500' },
    { name: 'r/music', members: '32.3M', icon: '🎵', color: '#7193FF' },
    { name: 'r/books', members: '22.1M', icon: '📚', color: '#FF66AC' },
    { name: 'r/art', members: '25.7M', icon: '🎨', color: '#FFB000' },
    { name: 'r/photography', members: '19.4M', icon: '📷', color: '#24A0ED' },
    { name: 'r/food', members: '27.9M', icon: '🍕', color: '#FF4500' },
    { name: 'r/fitness', members: '11.2M', icon: '💪', color: '#0079D3' }
  ];

  const posts = [
    {
      id: 1,
      subreddit: 'r/technology',
      author: 'u/techEnthusiast',
      time: '3h ago',
      title: 'New breakthrough in quantum computing shows promise for real-world applications',
      content: 'Researchers at MIT have developed a new approach that could make quantum computers more practical for everyday use. The team has successfully demonstrated a method to reduce error rates by 40%.',
      upvotes: 12400,
      comments: 834,
      awards: 5,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%234A90E2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EQuantum Computing Research%3C/text%3E%3C/svg%3E',
      flair: 'Research'
    },
    {
      id: 2,
      subreddit: 'r/gaming',
      author: 'u/pixelmaster',
      time: '5h ago',
      title: 'After 300 hours, I finally completed every achievement in Elden Ring',
      content: 'What a journey this has been. Here are some tips for anyone attempting the same challenge. The hardest part was definitely Malenia, but with patience and the right build, anything is possible!',
      upvotes: 8900,
      comments: 456,
      awards: 12,
      flair: 'Achievement'
    },
    {
      id: 3,
      subreddit: 'r/science',
      author: 'u/labCoat42',
      time: '7h ago',
      title: 'New study reveals fascinating connection between sleep patterns and memory formation',
      content: 'A comprehensive 5-year study involving 10,000 participants has uncovered surprising insights about how our brains consolidate memories during different sleep stages.',
      upvotes: 15600,
      comments: 1203,
      awards: 8,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%2346D160"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3ESleep and Memory Study%3C/text%3E%3C/svg%3E',
      flair: 'Neuroscience'
    },
    {
      id: 4,
      subreddit: 'r/movies',
      author: 'u/cinephile2024',
      time: '9h ago',
      title: 'Just watched "The Prestige" for the 10th time and noticed this incredible detail',
      content: 'In the opening scene, you can actually see a subtle hint about the ending that I never noticed before. Christopher Nolan is a genius at planting these easter eggs!',
      upvotes: 6700,
      comments: 289,
      awards: 3,
      flair: 'Discussion'
    },
    {
      id: 5,
      subreddit: 'r/art',
      author: 'u/creativeCanvas',
      time: '11h ago',
      title: 'Finished my first oil painting after years of wanting to learn',
      content: 'I\'m so proud of how this turned out. It took me about 40 hours over 2 weeks. Constructive criticism welcome!',
      upvotes: 9200,
      comments: 567,
      awards: 15,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF6B6B;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FFD93D;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EOil Painting Artwork%3C/text%3E%3C/svg%3E',
      flair: 'Original Work'
    },
    {
      id: 6,
      subreddit: 'r/gaming',
      author: 'u/speedRunner88',
      time: '13h ago',
      title: 'World record speedrun: Beat Dark Souls in 23 minutes',
      content: 'After months of practice and optimization, I finally got the world record! Here\'s a breakdown of the route and strategies I used.',
      upvotes: 11200,
      comments: 623,
      awards: 18,
      flair: 'Achievement'
    },
    {
      id: 7,
      subreddit: 'r/movies',
      author: 'u/filmBuff',
      time: '14h ago',
      title: 'Why "Blade Runner 2049" is the perfect sequel',
      content: 'Let\'s discuss how Denis Villeneuve managed to create a sequel that honors the original while telling its own compelling story.',
      upvotes: 5400,
      comments: 412,
      awards: 6,
      flair: 'Discussion'
    }
  ];

  const comments = [
    {
      id: 1,
      author: 'u/quantum_physicist',
      time: '2h ago',
      content: 'This is absolutely groundbreaking! I\'ve been following this research group for years and they\'ve consistently delivered impressive results. The implications for cryptography alone are massive.',
      upvotes: 456,
      replies: [
        {
          id: 11,
          author: 'u/cryptoExpert',
          time: '1h ago',
          content: 'Agreed! This could completely change how we approach encryption in the next decade. Very exciting times.',
          upvotes: 123
        },
        {
          id: 12,
          author: 'u/techEnthusiast',
          time: '1h ago',
          content: 'Thanks for the support! I\'m excited to see where this technology goes. The team is already working on practical applications.',
          upvotes: 234,
          isOP: true
        }
      ]
    },
    {
      id: 2,
      author: 'u/scienceTeacher',
      time: '2h ago',
      content: 'Can someone ELI5 what makes this approach different from previous quantum computing methods?',
      upvotes: 289,
      replies: [
        {
          id: 21,
          author: 'u/quantumSimplified',
          time: '1h ago',
          content: 'Sure! Traditional quantum computers struggle with errors because qubits are very fragile. This new method uses a clever error-correction technique that doesn\'t require as many physical qubits, making it more practical to build.',
          upvotes: 412
        }
      ]
    },
    {
      id: 3,
      author: 'u/skepticalScientist',
      time: '1h ago',
      content: 'While this is impressive, we should be cautious about overhyping quantum computing. We\'re still many years away from practical, everyday applications.',
      upvotes: 178,
      replies: []
    },
    {
      id: 4,
      author: 'u/industryInsider',
      time: '1h ago',
      content: 'I work in the quantum computing industry and this is genuinely significant. The 40% error reduction is no joke - that\'s the kind of improvement that can accelerate timelines by years.',
      upvotes: 567,
      replies: []
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'upvote',
      message: 'u/randomUser upvoted your post in r/technology',
      time: '2h ago',
      unread: true
    },
    {
      id: 2,
      type: 'comment',
      message: 'u/commenter123 replied to your comment in r/gaming',
      time: '5h ago',
      unread: true
    },
    {
      id: 3,
      type: 'award',
      message: 'Your post received a Gold Award!',
      time: '1d ago',
      unread: false
    },
    {
      id: 4,
      type: 'trending',
      message: 'Your post is trending in r/science',
      time: '2d ago',
      unread: false
    }
  ];

  const handleVote = (postId, voteType) => {
    setVotedPosts(prev => ({
      ...prev,
      [postId]: prev[postId] === voteType ? null : voteType
    }));
  };

  const handleCommentVote = (commentId, voteType) => {
    setVotedComments(prev => ({
      ...prev,
      [commentId]: prev[commentId] === voteType ? null : voteType
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const navigateToPost = (post) => {
    setSelectedPost(post);
    setCurrentView('post-detail');
  };

  const navigateToTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic-feed');
  };

  const navigateBack = () => {
    if (currentView === 'post-detail' || currentView === 'topic-feed') {
      setCurrentView('feed');
      setSelectedPost(null);
      setSelectedTopic(null);
    } else if (currentView === 'community-feed') {
      setCurrentView('feed');
      setSelectedCommunity(null);
    }
  };

  const navigateToCommunity = (community) => {
    setSelectedCommunity(community);
    setCurrentView('community-feed');
    // Stay in Communities tab instead of switching to Home
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setIsSearchActive(text.length > 0);
  };

  const getSearchResults = () => {
    if (!searchText) return [];
    
    const query = searchText.toLowerCase();
    const matchingPosts = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.subreddit.toLowerCase().includes(query)
    );
    
    const matchingCommunities = subreddits.filter(sub =>
      sub.name.toLowerCase().includes(query)
    );
    
    return { posts: matchingPosts.slice(0, 5), communities: matchingCommunities.slice(0, 3) };
  };

  const getFilteredPosts = () => {
    if (selectedTopic) {
      return posts.filter(post => post.flair === selectedTopic);
    }
    return posts;
  };

  const getSortedComments = () => {
    let sortedComments = [...comments];
    
    switch(commentSort) {
      case 'top':
        return sortedComments.sort((a, b) => b.upvotes - a.upvotes);
      case 'new':
        return sortedComments.reverse();
      case 'controversial':
        return sortedComments.sort((a, b) => {
          const aRatio = Math.abs(a.upvotes - 100);
          const bRatio = Math.abs(b.upvotes - 100);
          return aRatio - bRatio;
        });
      default: // best
        return sortedComments;
    }
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'reply' : ''}`}>
      <div className="comment-vote">
        <button
          className={`vote-btn ${votedComments[comment.id] === 'up' ? 'voted-up' : ''}`}
          onClick={() => handleCommentVote(comment.id, 'up')}
        >
          <ChevronUp size={16} />
        </button>
        <div className="vote-line" />
        <button
          className={`vote-btn down ${votedComments[comment.id] === 'down' ? 'voted-down' : ''}`}
          onClick={() => handleCommentVote(comment.id, 'down')}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          {comment.isOP && <span className="op-badge">OP</span>}
          <span className="comment-time">• {comment.time}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <span className={`comment-score ${votedComments[comment.id] === 'up' ? 'voted-up' : votedComments[comment.id] === 'down' ? 'voted-down' : ''}`}>
            {formatNumber(comment.upvotes + (votedComments[comment.id] === 'up' ? 1 : votedComments[comment.id] === 'down' ? -1 : 0))} points
          </span>
          <button className="comment-action-btn">
            <MessageCircle size={14} />
            Reply
          </button>
          <button className="comment-action-btn">
            <Share2 size={14} />
            Share
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPostDetail = () => {
    if (!selectedPost) return null;

    return (
      <div className="post-detail-container">
        <div className="post-detail-card">
          <div className="post-header">
            <button className="back-icon-btn" onClick={navigateBack}>
              <ArrowLeft size={20} />
            </button>
            <div className="post-meta">
              <span className="subreddit-name">{selectedPost.subreddit}</span>
              <span className="post-time">• {selectedPost.time.replace(' ago', '')}</span>
            </div>
            <button className="action-btn more" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="post-content">
            <h2 className="post-title-detail">{selectedPost.title}</h2>
            <p className="post-text">{selectedPost.content}</p>
            {selectedPost.image && (
              <div className="post-image-container">
                <img src={selectedPost.image} alt="Post content" className="post-image" />
              </div>
            )}
            {selectedPost.flair && (
              <span className="post-flair" onClick={(e) => {
                e.stopPropagation();
                navigateToTopic(selectedPost.flair);
              }}>
                {selectedPost.flair}
              </span>
            )}
          </div>

          <div className="post-actions">
            <div className="vote-section">
              <button
                className={`vote-btn ${votedPosts[selectedPost.id] === 'up' ? 'voted-up' : ''}`}
                onClick={() => handleVote(selectedPost.id, 'up')}
              >
                <ChevronUp size={20} />
              </button>
              <span className={`vote-count ${votedPosts[selectedPost.id] === 'up' ? 'voted-up' : votedPosts[selectedPost.id] === 'down' ? 'voted-down' : ''}`}>
                {formatNumber(selectedPost.upvotes + (votedPosts[selectedPost.id] === 'up' ? 1 : votedPosts[selectedPost.id] === 'down' ? -1 : 0))}
              </span>
              <button
                className={`vote-btn down ${votedPosts[selectedPost.id] === 'down' ? 'voted-down' : ''}`}
                onClick={() => handleVote(selectedPost.id, 'down')}
              >
                <ChevronUp size={20} />
              </button>
            </div>

            <button className="action-btn">
              <MessageCircle size={18} />
              <span>{formatNumber(selectedPost.comments)}</span>
            </button>

            <button className="action-btn">
              <Share2 size={18} />
            </button>

            {selectedPost.awards > 0 && (
              <button className="action-btn">
                <Award size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({comments.length})</h3>
            <select 
              className="comment-sort" 
              value={commentSort}
              onChange={(e) => setCommentSort(e.target.value)}
            >
              <option value="best">Best</option>
              <option value="top">Top</option>
              <option value="new">New</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <div className="comments-list">
            {getSortedComments().map(comment => renderComment(comment))}
          </div>
        </div>

        <div className="sticky-comment-bar">
          <div className="comment-input-container">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button className="send-comment-btn">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPostCard = (post) => (
    <div key={post.id} className="post-card" onClick={() => navigateToPost(post)}>
      <div className="post-header">
        <div className="post-meta">
          <span className="subreddit-name">{post.subreddit}</span>
          <span className="post-time">• {post.time.replace(' ago', '')}</span>
        </div>
        <button className="action-btn more" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post content" className="post-image" />
          </div>
        )}
        {post.flair && (
          <span 
            className="post-flair" 
            onClick={(e) => {
              e.stopPropagation();
              navigateToTopic(post.flair);
            }}
          >
            {post.flair}
          </span>
        )}
      </div>

      <div className="post-actions" onClick={(e) => e.stopPropagation()}>
        <div className="vote-section">
          <button
            className={`vote-btn ${votedPosts[post.id] === 'up' ? 'voted-up' : ''}`}
            onClick={() => handleVote(post.id, 'up')}
          >
            <ChevronUp size={20} />
          </button>
          <span className={`vote-count ${votedPosts[post.id] === 'up' ? 'voted-up' : votedPosts[post.id] === 'down' ? 'voted-down' : ''}`}>
            {formatNumber(post.upvotes + (votedPosts[post.id] === 'up' ? 1 : votedPosts[post.id] === 'down' ? -1 : 0))}
          </span>
          <button
            className={`vote-btn down ${votedPosts[post.id] === 'down' ? 'voted-down' : ''}`}
            onClick={() => handleVote(post.id, 'down')}
          >
            <ChevronUp size={20} />
          </button>
        </div>

        <button className="action-btn">
          <MessageCircle size={18} />
          <span>{formatNumber(post.comments)}</span>
        </button>

        <button className="action-btn">
          <Share2 size={18} />
        </button>

        {post.awards > 0 && (
          <button className="action-btn">
            <Award size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const renderHomeFeed = () => {
    return (
      <div className="feed-container">
      {currentView === 'topic-feed' && (
          <div className="topic-header">
            <div className="topic-title-row">
              <button className="back-icon-btn" onClick={navigateBack}>
                <ArrowLeft size={20} />
              </button>
              <h2>Posts tagged: {selectedTopic}</h2>
            </div>
            <p>{getFilteredPosts().length} posts</p>
          </div>
        )}

        {currentView === 'post-detail' ? renderPostDetail() : getFilteredPosts().map(post => renderPostCard(post))}
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="notifications-container">
      <h2 className="page-title">Notifications</h2>
      {notifications.map(notif => (
        <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
          <div className={`notif-icon ${notif.type}`}>
            {notif.type === 'upvote' && <ChevronUp size={20} />}
            {notif.type === 'comment' && <MessageCircle size={20} />}
            {notif.type === 'award' && <Award size={20} />}
            {notif.type === 'trending' && <TrendingUp size={20} />}
          </div>
          <div className="notif-content">
            <p className="notif-message">{notif.message}</p>
            <span className="notif-time">{notif.time}</span>
          </div>
          {notif.unread && <div className="unread-dot" />}
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <h2 className="profile-name">u/YourUsername</h2>
        <p className="profile-karma">
          <span className="karma-item">
            <ChevronUp size={16} />
            42.5k karma
          </span>
          <span className="karma-divider">•</span>
          <span className="karma-item">3y on Reddit</span>
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">156</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">2.4k</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">28</div>
          <div className="stat-label">Awards</div>
        </div>
      </div>

      <div className="profile-sections">
        <button className="profile-section-btn">
          <Bookmark size={20} />
          <span>Saved Posts</span>
        </button>
        <button className="profile-section-btn">
          <Eye size={20} />
          <span>History</span>
        </button>
        <button className="profile-section-btn">
          <Award size={20} />
          <span>Achievements</span>
        </button>
      </div>
    </div>
  );

  const renderSearch = () => {
    const results = getSearchResults();
    
    return (
      <div className="search-results-container">
        {results.communities.length > 0 && (
          <div className="search-section">
            <h3 className="search-section-title">Communities</h3>
            {results.communities.map((sub, index) => (
              <div 
                key={index} 
                className="search-result-item"
                onClick={() => {
                  navigateToCommunity(sub);
                  setSearchText('');
                  setIsSearchActive(false);
                }}
              >
                <div className="subreddit-icon" style={{ backgroundColor: sub.color }}>
                  <span>{sub.icon}</span>
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{sub.name}</div>
                  <div className="search-result-meta">{sub.members} members</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {results.posts.length > 0 && (
          <div className="search-section">
            <h3 className="search-section-title">Posts</h3>
            {results.posts.map((post) => (
              <div 
                key={post.id} 
                className="search-result-item"
                onClick={() => {
                  navigateToPost(post);
                  setSearchText('');
                  setIsSearchActive(false);
                }}
              >
                <div className="search-result-info">
                  <div className="search-result-name">{post.title}</div>
                  <div className="search-result-meta">{post.subreddit} • {formatNumber(post.upvotes)} upvotes</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {results.communities.length === 0 && results.posts.length === 0 && (
          <div className="no-results">
            <p>No results found for "{searchText}"</p>
          </div>
        )}
      </div>
    );
  };

  const renderCreateSheet = () => (
    <div className={`bottom-sheet ${showCreateSheet ? 'show' : ''}`}>
      <div className="bottom-sheet-backdrop" onClick={() => setShowCreateSheet(false)} />
      <div className="bottom-sheet-content">
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <h2>Create a post</h2>
          <button className="close-sheet" onClick={() => setShowCreateSheet(false)}>×</button>
        </div>
        
        <div className="create-options">
          <button className="create-option">
            <MessageCircle size={24} />
            <span>Text Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">📷</div>
            <span>Image Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">🔗</div>
            <span>Link Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">🎥</div>
            <span>Video Post</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommunities = () => {
    if (currentView === 'community-feed' && selectedCommunity) {
      const communityPosts = posts.filter(post => post.subreddit === selectedCommunity.name);
      
      return (
        <div className="feed-container">
          <div className="community-header">
            <div className="community-title-row">
              <button className="back-icon-btn" onClick={navigateBack}>
                <ArrowLeft size={20} />
              </button>
              <div className="community-icon-large" style={{ backgroundColor: selectedCommunity.color }}>
                <span>{selectedCommunity.icon}</span>
              </div>
            </div>
            <h2>{selectedCommunity.name}</h2>
            <p>{selectedCommunity.members} members</p>
            <button className="join-btn-large">Join Community</button>
          </div>
          
          {communityPosts.map(post => renderPostCard(post))}
        </div>
      );
    }

    const filteredSubreddits = subreddits.filter(sub => 
      sub.name.toLowerCase().includes(subredditSearch.toLowerCase())
    );

    return (
      <div className="communities-container">
        <div className="search-container-inline">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search communities..." 
            value={subredditSearch}
            onChange={(e) => setSubredditSearch(e.target.value)}
          />
        </div>
        <div className="subreddit-list-inline">
          {filteredSubreddits.map((sub, index) => (
            <div 
              key={index} 
              className="subreddit-item clickable" 
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigateToCommunity(sub)}
            >
              <div className="subreddit-icon" style={{ backgroundColor: sub.color }}>
                <span>{sub.icon}</span>
              </div>
              <div className="subreddit-info">
                <div className="subreddit-name">{sub.name}</div>
                <div className="subreddit-members">{sub.members} members</div>
              </div>
              <button className="chevron-btn">
                <ChevronUp size={18} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          ))}
          {filteredSubreddits.length === 0 && (
            <div className="no-results">
              <p>No communities found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubredditMenu = () => {
    const filteredSubreddits = subreddits.filter(sub => 
      sub.name.toLowerCase().includes(subredditSearch.toLowerCase())
    );

    return (
      <div className={`subreddit-menu ${showSubredditMenu ? 'show' : ''}`}>
        <div className="menu-header">
          <h2>Communities</h2>
          <button className="close-menu" onClick={() => setShowSubredditMenu(false)}>×</button>
        </div>
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search communities..." 
            value={subredditSearch}
            onChange={(e) => setSubredditSearch(e.target.value)}
          />
        </div>
        <div className="subreddit-list">
          {filteredSubreddits.map((sub, index) => (
            <div key={index} className="subreddit-item" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="subreddit-icon" style={{ backgroundColor: sub.color }}>
                <span>{sub.icon}</span>
              </div>
              <div className="subreddit-info">
                <div className="subreddit-name">{sub.name}</div>
                <div className="subreddit-members">{sub.members} members</div>
              </div>
              <button className="join-btn">Join</button>
            </div>
          ))}
          {filteredSubreddits.length === 0 && (
            <div className="no-results">
              <p>No communities found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-frame">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        body {
          background: #DAE0E6;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .mobile-frame {
          width: 100%;
          max-width: 390px;
          height: 844px;
          background: #000;
          border-radius: 40px;
          padding: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 8px #1a1a1a,
                      0 0 0 10px #2a2a2a;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
        }

        .mobile-frame::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 28px;
          background: #000;
          border-radius: 0 0 20px 20px;
          z-index: 1000;
        }

        .reddit-mobile {
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          width: 100%;
          height: 100%;
          background: #DAE0E6;
          color: #1A1A1B;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          border-radius: 32px;
        }

        /* Top Bar - Using semantic tokens */
        .top-bar {
          background: #FFFFFF;
          padding: 48px 16px 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #EDEFF1;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .search-field-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          padding: 8px 12px;
          border-radius: 20px;
        }

        .search-icon {
          color: #7C7C7C;
          flex-shrink: 0;
        }

        .search-field {
          flex: 1;
          background: none;
          border: none;
          color: #1A1A1B;
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .search-field::placeholder {
          color: #7C7C7C;
        }

        .create-btn {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          color: #7C7C7C;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 400;
          line-height: 1;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .create-btn:hover {
          background: #E9EAEB;
        }

        .create-btn:active {
          transform: scale(0.95);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FF4500;
          letter-spacing: -0.025rem;
        }

        .top-actions {
          display: flex;
          gap: 12px;
        }

        .icon-btn {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          color: #1A1A1B;
          padding: 8px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: #E9EAEB;
        }

        .icon-btn:active {
          transform: scale(0.95);
        }

        /* Content Area */
        .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 70px;
          background: #DAE0E6;
        }

        .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .feed-container {
          animation: fadeIn 300ms ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Back Button */
        .back-btn {
          background: #FFFFFF;
          border: 1px solid #EDEFF1;
          color: #1A1A1B;
          padding: 8px 16px;
          margin: 12px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: -0.0125rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 150ms ease;
        }

        .back-btn:hover {
          background: #F6F7F8;
        }

        /* Topic Header */
        .topic-header {
          padding: 16px;
          background: #FFFFFF;
          border-bottom: 1px solid #EDEFF1;
        }

        .topic-header h2 {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          color: #FF4500;
          margin-bottom: 4px;
        }

        .topic-header p {
          font-size: 0.8125rem;
          line-height: 1.125rem;
          font-weight: 400;
          letter-spacing: -0.00625rem;
          color: #7C7C7C;
        }

        /* Sort Bar */
        .sort-bar {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          overflow-x: auto;
          background: #FFFFFF;
          border-bottom: 1px solid #EDEFF1;
          -webkit-overflow-scrolling: touch;
        }

        .sort-bar::-webkit-scrollbar {
          display: none;
        }

        .sort-btn {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          color: #7C7C7C;
          padding: 8px 16px;
          border-radius: 16px;
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 600;
          letter-spacing: -0.0125rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sort-btn.active {
          background: #FF4500;
          border-color: #FF4500;
          color: white;
        }

        /* Post Card */
        .post-card {
          background: #FFFFFF;
          margin: 0;
          border-radius: 0;
          border-bottom: 1px solid #EDEFF1;
          padding: 8px 16px;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .post-card:hover {
          background: #F6F7F8;
        }

        .post-header {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-icon-btn {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          color: #7C7C7C;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .back-icon-btn:hover {
          background: #E9EAEB;
        }

        .back-icon-btn:active {
          transform: scale(0.95);
        }

        .post-meta {
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 400;
          letter-spacing: -0.00625rem;
          color: #7C7C7C;
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .subreddit-name {
          color: #1A1A1B;
          font-weight: 700;
        }

        .post-content {
          margin-bottom: 6px;
        }

        .post-title {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01875rem;
          margin-bottom: 4px;
          color: #1A1A1B;
        }

        .post-title-detail {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          margin-bottom: 12px;
          color: #1A1A1B;
        }

        .post-flair {
          display: inline-block;
          background: transparent;
          color: #7C7C7C;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 600;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
          margin-top: 8px;
          margin-bottom: 0;
          border: 1px solid #CCCCCC;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .post-flair:hover {
          background: #F6F7F8;
          border-color: #999999;
        }

        .post-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          color: #1A1A1B;
          margin-bottom: 6px;
        }

        .post-image-container {
          border-radius: 8px;
          overflow: hidden;
          margin-top: 6px;
          border: 1px solid #EDEFF1;
        }

        .post-image {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Actions */
        .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 4px;
        }

        .vote-section {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          padding: 4px 8px;
          border-radius: 16px;
        }

        .vote-btn {
          background: none;
          border: none;
          color: #7C7C7C;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 150ms ease;
          padding: 4px;
        }

        .vote-btn.down {
          transform: rotate(180deg);
        }

        .vote-btn.voted-up {
          color: #FF4500;
        }

        .vote-btn.voted-down {
          color: #7193FF;
        }

        .vote-btn:hover {
          transform: scale(1.2);
        }

        .vote-btn.down:hover {
          transform: rotate(180deg) scale(1.2);
        }

        .vote-count {
          font-weight: 700;
          font-size: 0.8125rem;
          line-height: 1rem;
          letter-spacing: -0.00625rem;
          color: #1A1A1B;
          min-width: 35px;
          text-align: center;
        }

        .vote-count.voted-up {
          color: #FF4500;
        }

        .vote-count.voted-down {
          color: #7193FF;
        }

        .action-btn {
          background: none;
          border: none;
          color: #7C7C7C;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 600;
          letter-spacing: 0.00625rem;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 150ms ease;
        }

        .action-btn:hover {
          background: #F6F7F8;
          color: #1A1A1B;
        }

        .action-btn.more {
          padding: 6px;
        }

        /* Post Detail */
        .post-detail-container {
          background: #DAE0E6;
        }

        .post-detail-card {
          background: #FFFFFF;
          border-bottom: 4px solid #EDEFF1;
          padding: 16px;
        }

        /* Comments */
        .comments-section {
          padding: 16px;
          padding-bottom: 80px;
          background: #FFFFFF;
        }

        .comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #EDEFF1;
        }

        .comments-header h3 {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01875rem;
          color: #1A1A1B;
        }

        .comment-sort {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          color: #1A1A1B;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.8125rem;
          line-height: 1rem;
          font-weight: 600;
          letter-spacing: -0.00625rem;
          cursor: pointer;
        }

        .add-comment {
          margin-bottom: 20px;
        }

        .comment-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F6F7F8;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid #EDEFF1;
        }

        .comment-input {
          flex: 1;
          background: none;
          border: none;
          color: #1A1A1B;
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .comment-input::placeholder {
          color: #7C7C7C;
        }

        .send-comment-btn {
          background: #878A8C;
          border: none;
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .send-comment-btn:hover {
          background: #6E7071;
        }

        .sticky-comment-bar {
          position: sticky;
          bottom: 7px;
          left: 0;
          right: 0;
          background: #FFFFFF;
          padding: 12px 16px;
          padding-bottom: 12px;
          border-top: 1px solid #EDEFF1;
          z-index: 50;
        }

        .post-title-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .post-title-row .back-icon-btn {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .post-title-row .post-title-detail {
          margin-bottom: 0;
        }

        .topic-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .topic-title-row h2 {
          margin: 0;
        }

        .community-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .community-title-row .community-icon-large {
          margin: 0;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .comment {
          display: flex;
          gap: 8px;
        }

        .comment.reply {
          margin-left: 32px;
        }

        .comment-vote {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 4px;
          gap: 4px;
        }

        .vote-line {
          width: 2px;
          flex: 1;
          background: #EDEFF1;
          min-height: 20px;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .comment-author {
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 700;
          color: #1A1A1B;
        }

        .op-badge {
          background: #FF4500;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          line-height: 1rem;
          font-weight: 600;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
        }

        .comment-time {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #7C7C7C;
        }

        .comment-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          color: #1A1A1B;
          margin-bottom: 8px;
        }

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .comment-score {
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 700;
          color: #7C7C7C;
        }

        .comment-score.voted-up {
          color: #FF4500;
        }

        .comment-score.voted-down {
          color: #7193FF;
        }

        .comment-action-btn {
          background: none;
          border: none;
          color: #7C7C7C;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 150ms ease;
        }

        .comment-action-btn:hover {
          background: #F6F7F8;
          color: #1A1A1B;
        }

        .replies {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Notifications & Profile */
        .notifications-container,
        .profile-container {
          padding: 20px 16px;
          animation: fadeIn 300ms ease;
        }

        .page-title {
          font-size: 1.5rem;
          line-height: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.0125rem;
          margin-bottom: 24px;
          color: #FF4500;
        }

        .notification-item {
          background: #FFFFFF;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid #EDEFF1;
          position: relative;
          transition: all 150ms ease;
        }

        .notification-item.unread {
          background: #FFF4E6;
          border-color: #FFDFC4;
        }

        .notification-item:hover {
          background: #F6F7F8;
        }

        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-icon.upvote {
          background: #FFF4E6;
          color: #FF4500;
        }

        .notif-icon.comment {
          background: #EBF0FF;
          color: #7193FF;
        }

        .notif-icon.award {
          background: #FFFBEB;
          color: #FFD700;
        }

        .notif-icon.trending {
          background: #ECFDF5;
          color: #46D160;
        }

        .notif-content {
          flex: 1;
        }

        .notif-message {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          color: #1A1A1B;
          margin-bottom: 4px;
        }

        .notif-time {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #7C7C7C;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #FF4500;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        /* Profile */
        .profile-header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #EDEFF1;
          margin-bottom: 20px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #FF4500;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: white;
          border: 3px solid #EDEFF1;
        }

        .profile-name {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          margin-bottom: 8px;
          color: #1A1A1B;
        }

        .profile-karma {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #7C7C7C;
          font-size: 0.8125rem;
          line-height: 1.125rem;
          font-weight: 400;
          letter-spacing: -0.00625rem;
        }

        .karma-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .karma-divider {
          color: #EDEFF1;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-item {
          background: #FFFFFF;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #EDEFF1;
          transition: all 150ms ease;
        }

        .stat-item:hover {
          background: #F6F7F8;
          border-color: #FF4500;
        }

        .stat-value {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          color: #FF4500;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #7C7C7C;
          font-weight: 600;
        }

        .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .profile-section-btn {
          background: #FFFFFF;
          border: 1px solid #EDEFF1;
          color: #1A1A1B;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9375rem;
          line-height: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.01875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 150ms ease;
        }

        .profile-section-btn:hover {
          background: #F6F7F8;
          border-color: #FF4500;
        }

        /* Subreddit Menu - Contained within mobile frame */
        .subreddit-menu {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #DAE0E6;
          z-index: 200;
          transform: translateX(-100%);
          transition: transform 300ms ease;
          display: flex;
          flex-direction: column;
          border-radius: 32px;
        }

        .subreddit-menu.show {
          transform: translateX(0);
        }

        .menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 48px 16px 16px 16px;
          border-bottom: 1px solid #EDEFF1;
          background: #FFFFFF;
        }

        .menu-header h2 {
          font-size: 1.5rem;
          line-height: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.0125rem;
          color: #FF4500;
        }

        .close-menu {
          background: none;
          border: none;
          color: #1A1A1B;
          font-size: 32px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 150ms ease;
        }

        .close-menu:hover {
          background: #F6F7F8;
        }

        .search-container {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border-bottom: 1px solid #EDEFF1;
          color: #7C7C7C;
        }

        .search-container input {
          flex: 1;
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          padding: 10px 14px;
          border-radius: 20px;
          color: #1A1A1B;
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .search-container input::placeholder {
          color: #7C7C7C;
        }

        .subreddit-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .subreddit-list::-webkit-scrollbar {
          width: 6px;
        }

        .subreddit-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .subreddit-list::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .subreddit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FFFFFF;
          border: 1px solid #EDEFF1;
          border-radius: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 150ms ease;
          animation: slideIn 300ms ease both;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .subreddit-item:hover {
          background: #F6F7F8;
          border-color: #FF4500;
        }

        .subreddit-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .subreddit-info {
          flex: 1;
        }

        .subreddit-name {
          font-weight: 700;
          font-size: 0.875rem;
          line-height: 1.375rem;
          letter-spacing: -0.0125rem;
          color: #1A1A1B;
          margin-bottom: 2px;
        }

        .subreddit-members {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #7C7C7C;
        }

        .join-btn {
          background: #FF4500;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 0.75rem;
          line-height: 1rem;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .join-btn:hover {
          background: #FF5722;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #7C7C7C;
        }

        .no-results p {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
        }

        /* Communities Tab */
        .communities-container {
          padding: 16px;
          animation: fadeIn 300ms ease;
        }

        .search-container-inline {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #EDEFF1;
          border-radius: 20px;
          margin-bottom: 16px;
          color: #7C7C7C;
        }

        .search-container-inline input {
          flex: 1;
          background: none;
          border: none;
          color: #1A1A1B;
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .search-container-inline input::placeholder {
          color: #7C7C7C;
        }

        .subreddit-list-inline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .subreddit-item.clickable {
          cursor: pointer;
        }

        .chevron-btn {
          background: none;
          border: none;
          color: #7C7C7C;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .chevron-btn:hover {
          color: #1A1A1B;
        }

        /* Bottom Sheet */
        .bottom-sheet {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 300;
          pointer-events: none;
          opacity: 0;
          transition: opacity 300ms ease;
          border-radius: 32px;
          overflow: hidden;
        }

        .bottom-sheet.show {
          pointer-events: auto;
          opacity: 1;
        }

        .bottom-sheet-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 32px;
        }

        .bottom-sheet-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #FFFFFF;
          border-radius: 32px 32px 0 0;
          padding: 20px;
          transform: translateY(100%);
          transition: transform 300ms ease;
          max-height: 60vh;
        }

        .bottom-sheet.show .bottom-sheet-content {
          transform: translateY(0);
        }

        .bottom-sheet-handle {
          width: 40px;
          height: 4px;
          background: #EDEFF1;
          border-radius: 2px;
          margin: 0 auto 20px;
        }

        .bottom-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .bottom-sheet-header h2 {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          color: #1A1A1B;
        }

        .close-sheet {
          background: none;
          border: none;
          color: #7C7C7C;
          font-size: 32px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 150ms ease;
        }

        .close-sheet:hover {
          background: #F6F7F8;
        }

        .create-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .create-option {
          background: #F6F7F8;
          border: 1px solid #EDEFF1;
          padding: 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 150ms ease;
          color: #1A1A1B;
        }

        .create-option:hover {
          background: #E9EAEB;
          border-color: #FF4500;
        }

        .create-option span {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 600;
          letter-spacing: -0.0125rem;
        }

        .icon-placeholder {
          font-size: 24px;
        }

        /* Search Results */
        .search-results-container {
          padding: 16px;
          animation: fadeIn 300ms ease;
        }

        .search-section {
          margin-bottom: 24px;
        }

        .search-section-title {
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 700;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
          color: #7C7C7C;
          margin-bottom: 12px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FFFFFF;
          border: 1px solid #EDEFF1;
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .search-result-item:hover {
          background: #F6F7F8;
          border-color: #FF4500;
        }

        .search-result-info {
          flex: 1;
          min-width: 0;
        }

        .search-result-name {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 600;
          letter-spacing: -0.0125rem;
          color: #1A1A1B;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-result-meta {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #7C7C7C;
        }

        /* Community Header */
        .community-header {
          background: #FFFFFF;
          padding: 24px 16px;
          text-align: center;
          border-bottom: 1px solid #EDEFF1;
        }

        .community-icon-large {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 16px;
        }

        .community-header h2 {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          color: #1A1A1B;
          margin-bottom: 4px;
        }

        .community-header p {
          font-size: 0.8125rem;
          line-height: 1.125rem;
          font-weight: 400;
          letter-spacing: -0.00625rem;
          color: #7C7C7C;
          margin-bottom: 16px;
        }

        .join-btn-large {
          background: #FF4500;
          border: none;
          color: white;
          padding: 10px 24px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.875rem;
          line-height: 1.375rem;
          letter-spacing: -0.0125rem;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .join-btn-large:hover {
          background: #FF5722;
        }

        /* Bottom Nav - Contained within mobile frame */
        .bottom-nav {
          background: #FFFFFF;
          border-top: 1px solid #EDEFF1;
          padding: 8px 0 12px 0;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          z-index: 100;
          border-radius: 0 0 32px 32px;
        }

        .nav-item {
          background: none;
          border: none;
          color: #7C7C7C;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          transition: all 150ms ease;
          position: relative;
        }

        .nav-item:hover {
          color: #1A1A1B;
        }

        .nav-item.active {
          color: #FF4500;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: #FF4500;
          border-radius: 0 0 3px 3px;
        }

        .nav-label {
          font-size: 0.625rem;
          line-height: 1rem;
          font-weight: 700;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
        }
      `}</style>

      <div className="reddit-mobile">
        <div className="top-bar">
          <div className="search-field-container">
            <div className="reddit-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#FF4500"/>
                <circle cx="7" cy="9" r="1.5" fill="white"/>
                <circle cx="13" cy="9" r="1.5" fill="white"/>
                <path d="M6.5 12C6.5 12 7.5 14 10 14C12.5 14 13.5 12 13.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Reddit"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-field"
            />
          </div>
          <button className="create-btn" onClick={() => setShowCreateSheet(true)}>
            <span>+</span>
          </button>
        </div>

        <div className="content-area">
          {isSearchActive ? (
            renderSearch()
          ) : (
            <>
              {activeTab === 'home' && renderHomeFeed()}
              {activeTab === 'communities' && renderCommunities()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'profile' && renderProfile()}
            </>
          )}
        </div>

        {renderSubredditMenu()}
        {renderCreateSheet()}

        <div className="bottom-nav">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
              setCurrentView('feed');
              setIsSearchActive(false);
              setSearchText('');
            }}
          >
            <Home size={24} />
            <span className="nav-label">Home</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'communities' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('communities');
              setIsSearchActive(false);
              setSearchText('');
            }}
          >
            <Menu size={24} />
            <span className="nav-label">Communities</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('notifications');
              setIsSearchActive(false);
              setSearchText('');
            }}
          >
            <Bell size={24} />
            <span className="nav-label">Inbox</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setIsSearchActive(false);
              setSearchText('');
            }}
          >
            <User size={24} />
            <span className="nav-label">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedditMobile;
