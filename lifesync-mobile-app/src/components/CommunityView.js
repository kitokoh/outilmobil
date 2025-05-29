import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Users as UsersIcon, Plus, MessageCircle, Calendar, Download, Star, Share2, Crown } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const CommunityView = ({ styles }) => { // Removed props now coming from store
  const friends = useStore((state) => state.friends);
  const communityTemplates = useStore((state) => state.communityTemplates);
  const profileTemplates = useStore((state) => state.profileTemplates);
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  // Consider adding actions for friend/template/group interactions

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Communauté</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}><UsersIcon size={20} color="#4B5563" /></TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, {backgroundColor: '#3B82F6'}]}><Plus size={20} color="white" /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {['amis', 'templates', 'groupes'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView>
      {activeTab === 'amis' && (
        <View style={styles.listContainerNoGap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Amis connectés</Text>
            {friends.filter(f => f.status === 'online').map((friend) => (
              <View key={friend.id} style={styles.friendItemOnline}>
                <View style={styles.friendInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarLg}>{friend.avatar}</Text>
                    <View style={styles.statusIndicatorOnline}></View>
                  </View>
                  <View>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendMeta}>{friend.commonChallenges} défis en commun</Text>
                  </View>
                </View>
                <View style={styles.friendActions}>
                  <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#3B82F6'}]}><MessageCircle size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#10B981'}]}><Calendar size={16} color="white" /></TouchableOpacity>
                </View>
              </View>
            ))}
             {friends.filter(f => f.status === 'online').length === 0 && <Text style={styles.emptyListText}>Aucun ami connecté pour le moment.</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tous mes contacts ({friends.length})</Text>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendItem}>
                <View style={styles.friendInfo}>
                   <View style={styles.avatarContainer}>
                    <Text style={styles.avatarLg}>{friend.avatar}</Text>
                    <View style={[styles.statusIndicator, 
                      friend.status === 'online' ? styles.statusOnline : 
                      friend.status === 'busy' ? styles.statusBusy : styles.statusOffline
                    ]}></View>
                  </View>
                  <View>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendMeta}>Profil {profileTemplates[friend.profile]?.name}</Text>
                  </View>
                </View>
                <View style={styles.friendActions}>
                  <TouchableOpacity><MessageCircle size={16} color="#9CA3AF" /></TouchableOpacity>
                  <TouchableOpacity><Calendar size={16} color="#9CA3AF" /></TouchableOpacity>
                </View>
              </View>
            ))}
             {friends.length === 0 && <Text style={styles.emptyListText}>Vous n'avez pas encore de contacts.</Text>}
          </View>
        </View>
      )}

      {activeTab === 'templates' && (
         <View style={styles.listContainerNoGap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Templates populaires</Text>
            {communityTemplates.map((template) => (
              <View key={template.id} style={styles.templateItem}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <View style={styles.templateTitleContainer}>
                      <Text style={styles.templateTitle}>{template.title}</Text>
                      {template.premium && (
                        <View style={styles.premiumBadge}>
                          <Crown size={12} color="white" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.templateAuthor}>par {template.author}</Text>
                    <View style={styles.templateMetaRow}>
                      <Text style={styles.templateMeta}><Download size={16} color="#6B7280"/> {template.downloads}</Text>
                      <Text style={styles.templateMeta}><Star size={16} color="#F59E0B"/> {template.rating}</Text>
                      <Text style={[styles.badge, styles.categoryBadgeSmall]}>{profileTemplates[template.profile]?.name}</Text>
                    </View>
                  </View>
                  <View style={styles.templateActions}>
                    <TouchableOpacity style={styles.iconButtonSmall}><Share2 size={16} color="#4B5563" /></TouchableOpacity>
                    <TouchableOpacity style={template.premium ? styles.premiumButtonSmall : styles.primaryButtonSmall}>
                      <Text style={styles.primaryButtonSmallText}>{template.premium ? 'Premium' : 'Télécharger'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
             {communityTemplates.length === 0 && <Text style={styles.emptyListText}>Aucun template populaire pour le moment.</Text>}
          </View>
           <View style={styles.card}>
            <Text style={styles.cardTitle}>Mes templates partagés</Text>
            <View style={styles.emptyStateContainer}>
              <Share2 size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Vous n'avez pas encore partagé de templates</Text>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Partager ma routine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'groupes' && (
        <View style={styles.listContainerNoGap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Groupes par profil</Text>
            <View style={styles.gridTwoCols}>
              {Object.entries(profileTemplates).map(([key, profile]) => {
                const ProfileIcon = profile.icon; // Icon component from profileTemplates
                return (
                  <View key={key} style={styles.groupProfileCard}>
                    <View style={[styles.groupProfileIconContainer, {backgroundColor: profile.color || '#CCCCCC'}]}>
                      { ProfileIcon && <ProfileIcon size={24} color={profile.iconColor || "#FFFFFF"} /> }
                    </View>
                    <Text style={styles.groupProfileName}>{profile.name}</Text>
                    <Text style={styles.groupProfileMembers}>{Math.floor(Math.random() * 500) + 100} membres</Text>
                    <TouchableOpacity style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Rejoindre</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.card}>
             <Text style={styles.cardTitle}>Groupes d'intérêts</Text>
            {[
              { name: "Méditation & Mindfulness", members: 1234, category: "Bien-être", active: true },
              { name: "Productivité & Organisation", members: 2156, category: "Travail", active: false },
              { name: "Parents Entrepreneurs", members: 567, category: "Famille", active: true },
              { name: "Fitness & Nutrition", members: 1890, category: "Santé", active: false }
            ].map((group, idx) => (
              <View key={idx} style={styles.interestGroupItem}>
                <View>
                  <Text style={styles.interestGroupName}>{group.name}</Text>
                  <Text style={styles.interestGroupMeta}>{group.members} membres • {group.category}</Text>
                </View>
                <TouchableOpacity style={group.active ? styles.memberButton : styles.primaryButtonSmall}>
                  <Text style={group.active ? styles.memberButtonText : styles.primaryButtonSmallText}>
                    {group.active ? 'Membre' : 'Rejoindre'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

export default CommunityView;
