import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Plus, Trophy, Sparkles } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const ChallengesView = ({ styles }) => { // Removed props now coming from store
  const challenges = useStore((state) => state.challenges);
  const friends = useStore((state) => state.friends);
  // Consider adding actions to the store for creating/joining challenges
  // const createChallenge = useStore((state) => state.createChallenge);
  // const joinChallenge = useStore((state) => state.joinChallenge);

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Défis & Communauté</Text>
        {/* Create Challenge button using accent color */}
        <TouchableOpacity style={[styles.primaryButton, {backgroundColor: styles.colors.accent}]} onPress={() => { /* Call createChallenge action */ }}>
          <Plus size={16} color={styles.colors.textOnPrimary} />
          <Text style={styles.primaryButtonText}>Créer Défi</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Trophy size={20} color={styles.colors.warning} /><Text style={styles.cardTitle}> Mes défis actifs ({challenges.filter(c => c.joined).length})</Text></View>
        <View style={styles.listContainerNoGap}>
          {challenges.filter(c => c.joined).map((challenge) => (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <View style={{flex:1}}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} participants</Text>
                </View>
                <View style={styles.challengeTiming}>
                  {/* challengeDaysLeft color is amber500/warning by default from global styles */}
                  <Text style={styles.challengeDaysLeft}>{challenge.daysLeft} jours restants</Text>
                  {/* challengeReward color is slate500/textLight by default */}
                  <Text style={styles.challengeReward}>{challenge.reward}</Text>
                </View>
              </View>
              <View style={styles.challengeProgressContainer}>
                <View style={styles.challengeProgressTextContainer}>
                  {/* challengeProgressLabel color is slate700, consider textSecondary */}
                  <Text style={[styles.challengeProgressLabel, {color: styles.colors.textSecondary}]}>Progression</Text>
                  {/* challengeProgressPercent color is slate900/text by default */}
                  <Text style={styles.challengeProgressPercent}>{challenge.progress}%</Text>
                </View>
                {/* challengeProgressBarBackground is slate200/border, challengeProgressBar is amber500/warning by default */}
                <View style={styles.challengeProgressBarBackground}>
                  <View style={[styles.challengeProgressBar, { width: `${challenge.progress}%` }]}></View>
                </View>
              </View>
              <View style={styles.challengeFooter}>
                <View style={styles.avatarGroup}>
                  {/* avatarSmall bg is indigo600/primary, avatarText is white/textOnPrimary by default */}
                  {/* avatarSmallMore bg is slate500/textSecondary, avatarText is white/textOnPrimary by default */}
                  {friends.slice(0, 3).map((friend, idx) => (
                    <View key={idx} style={styles.avatarSmall}><Text style={styles.avatarText}>{friend.name[0]}</Text></View>
                  ))}
                  {challenge.participants > 3 && <View style={styles.avatarSmallMore}><Text style={styles.avatarText}>+{challenge.participants - 3}</Text></View>}
                </View>
                {/* linkText color is indigo600/primary by default */}
                <TouchableOpacity><Text style={styles.linkText}>Voir détails</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          {challenges.filter(c => c.joined).length === 0 && <Text style={styles.emptyListText}>Aucun défi actif pour le moment.</Text>}
        </View>
      </View>

      <View style={styles.card}>
        {/* Assuming pink600 is available via ...oldColors spread for Sparkles icon */}
        <View style={styles.cardHeaderIconWrapper}><Sparkles size={20} color={styles.colors.pink600 || styles.colors.secondary} /><Text style={styles.cardTitle}> Défis recommandés pour vous</Text></View>
        <View style={styles.listContainerNoGap}>
          {challenges.filter(c => !c.joined).map((challenge) => (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <View style={{flex:1}}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} participants actifs</Text>
                </View>
                {/* joinChallengeButton bg is sky500/secondary, text is white/textOnSecondary by default */}
                <TouchableOpacity style={styles.joinChallengeButton} onPress={() => { /* Call joinChallenge action with challenge.id */ }}>
                  <Text style={styles.joinChallengeButtonText}>Rejoindre</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.challengeDetails}>
                {/* challengeDetailText color is slate600/textSecondary by default */}
                <Text style={styles.challengeDetailText}>🏆 {challenge.reward}</Text>
                <Text style={styles.challengeDetailText}>⏱️ {challenge.daysLeft} jours</Text>
                <Text style={styles.challengeDetailText}>📈 {challenge.progress}% réussite moyenne</Text>
              </View>
            </View>
          ))}
           {challenges.filter(c => !c.joined).length === 0 && <Text style={styles.emptyListText}>Aucun nouveau défi recommandé.</Text>}
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

export default ChallengesView;
